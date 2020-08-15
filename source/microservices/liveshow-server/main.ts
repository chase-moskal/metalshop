
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

import * as evaluators from "../../business/core/user-evaluators.js"
import {makeLiveshowLizard} from "../../business/liveshow/liveshow-lizard.js"
import {LiveshowServerConfig, LiveshowRow, LiveshowApi} from "../../types.js"

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
	
	const liveshowLizard = makeLiveshowLizard({
		liveshowTable,
		authorize: verifyToken,
		userCanRead: evaluators.isPremium,
		userCanWrite: evaluators.isStaff,
	})
	
	const {koa: apiKoa} = await apiServer<LiveshowApi>({
		debug,
		logger,
		exposures: {
			liveshowLizard: {
				cors,
				exposed: liveshowLizard,
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
