
import {apiServer} from "renraku/dist/api-server.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import Koa from "../../commonjs/koa.js"
import mount from "../../commonjs/koa-mount.js"

import {health} from "../../toolbox/health.js"
import {generateId} from "../../toolbox/generate-id.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {nodeProgram} from "../../toolbox/node-program.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"

import * as evaluators from "../../business/core/user-evaluators.js"
import {makeCoreSystemsClients} from "../../business/core/core-clients.js"
import {makeQuestionQuarry} from "../../business/questions/question-quarry.js"

import {QuestionsServerConfig, QuestionRow, QuestionLikeRow, QuestionReportRow, QuestionsApi, MetalUser} from "../../types.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "metalback/config/config.yaml",
		authServerPublicKey: "metalback/config/auth-server.public.pem",
	}

	const config: QuestionsServerConfig = await readYaml(paths.config)
	const {debug, authServerOrigin} = config
	const {port} = config.questionsServer
	const cors = unpackCorsConfig(config.cors)

	const authServerPublicKey = await read(paths.authServerPublicKey)
	const verifyToken = curryVerifyToken(authServerPublicKey)

	const {userUmbrella} = await makeCoreSystemsClients<MetalUser>({
		coreServerOrigin: authServerOrigin
	})

	const {dbbyTable} = await connectMongo(config.mongo)
	const questionTable = dbbyTable<QuestionRow>("questions")
	const questionLikeTable = dbbyTable<QuestionLikeRow>("questionLikes")
	const questionReportTable = dbbyTable<QuestionReportRow>("questionReports")

	const questionQuarry = makeQuestionQuarry({
		userUmbrella,
		questionTable,
		questionLikeTable,
		questionReportTable,
		generateId,
		authorize: verifyToken,
		userCanArchiveBoard: evaluators.isStaff,
		userCanArchiveQuestion: (user, questionAuthorUserId) => (
			evaluators.isStaff(user)
			|| (user.userId === questionAuthorUserId)
		),
		userCanPost: evaluators.isPremium,
	})
	
	const {koa: apiKoa} = await apiServer<QuestionsApi>({
		debug,
		logger,
		exposures: {
			questionQuarry: {
				cors,
				exposed: questionQuarry,
			},
		}
	})
	
	new Koa()
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})
	
	logger.info(`🌐 questions-server on ${port}`)
})
