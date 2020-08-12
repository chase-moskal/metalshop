
import Koa from "../../commonjs/koa.js"
import mount from "../../commonjs/koa-mount.js"
import {apiServer} from "renraku/dist/api-server.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {dbbyMongo} from "../../toolbox/dbby/dbby-mongo.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"
import {deathWithDignity} from "../../toolbox/death-with-dignity.js"
import {makeNodeLogger} from "../../toolbox/logger/make-node-logger.js"

import * as evaluators from "../../business/core/user-evaluators.js"
import {makeLiveshowLizard} from "../../business/liveshow/liveshow-lizard.js"
import {LiveshowServerConfig, LiveshowRow, LiveshowApi} from "../../types.js"

const logger = makeNodeLogger()
deathWithDignity({logger})

const paths = {
	config: "metalback/config/config.yaml",
	authServerPublicKey: "metalback/config/auth-server.public.pem",
}

~async function main() {
	const config: LiveshowServerConfig = await readYaml(paths.config)
	const {debug} = config
	const {port} = config.liveshowServer
	const authServerPublicKey = await read(paths.authServerPublicKey)
	const cors = unpackCorsConfig(config.cors)

	const verifyToken = curryVerifyToken(authServerPublicKey)
	const database = await connectMongo(config.mongo)
	const liveshowTable = dbbyMongo<LiveshowRow>({
		collection: database.collection("liveshows")
	})

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
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 liveshow-server on ${port}`)

}().catch(error => logger.error(error))
