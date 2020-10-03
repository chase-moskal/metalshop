
import {apiServer} from "renraku/dist/api-server.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import Koa from "../../commonjs/koa.js"
import mount from "../../commonjs/koa-mount.js"
import koaCors from "../../commonjs/koa-cors.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {nodeProgram} from "../../toolbox/node-program.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"

import * as evaluators from "../../business/auth/user-evaluators.js"

import {makeLiveshowApi} from "../../features/liveshow/liveshow-api.js"
import {LiveshowRow, LiveshowApi} from "../../features/liveshow/liveshow-types.js"

import {LiveshowServerConfig, TopicAuthorizer, AccessPayload, AppPayload} from "../../types.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "config/config.yaml",
		authServerPublicKey: "config/auth-server.public.pem",
	}

	const config: LiveshowServerConfig = await readYaml(paths.config)
	const {debug} = config
	const {port} = config.liveshowServer
	const cors = unpackCorsConfig(config.cors)

	const authServerPublicKey = await read(paths.authServerPublicKey)
	const verifyToken = curryVerifyToken(authServerPublicKey)

	const {dbbyTable} = await connectMongo(config.mongo)
	const liveshowTable = dbbyTable<LiveshowRow>("liveshows")

	const auth: TopicAuthorizer = async({appToken, accessToken}) => ({
		app: await verifyToken<AppPayload>(appToken),
		access: await verifyToken<AccessPayload>(accessToken),
	})

	const liveshowApi = makeLiveshowApi({
		auth,
		getDbbyTable: dbbyTable,
		userCanRead: evaluators.isPremium,
		userCanWrite: evaluators.isStaff,
	})

	const {koa: apiKoa} = await apiServer<LiveshowApi>({
		debug,
		logger,
		exposures: {
			liveshowTopic: {
				cors,
				exposed: liveshowApi.liveshowTopic,
			},
		}
	})

	new Koa()
		.use(koaCors())
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 liveshow-server on ${port}`)
})
