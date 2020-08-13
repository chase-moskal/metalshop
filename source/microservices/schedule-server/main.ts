
import {apiServer} from "renraku/dist/api-server.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import Koa from "../../commonjs/koa.js"
import mount from "../../commonjs/koa-mount.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {nodeProgram} from "../../toolbox/node-program.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"

import * as evaluators from "../../business/core/user-evaluators.js"
import {makeScheduleSentry} from "../../business/schedule/schedule-sentry.js"

import {ScheduleServerConfig, ScheduleEventRow, ScheduleApi} from "../../types.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "metalback/config/config.yaml",
		authServerPublicKey: "metalback/config/auth-server.public.pem",
	}

	const config: ScheduleServerConfig = await readYaml(paths.config)
	const {debug} = config
	const {port} = config.scheduleServer
	const cors = unpackCorsConfig(config.cors)

	const authServerPublicKey = await read(paths.authServerPublicKey)
	const verifyToken = curryVerifyToken(authServerPublicKey)

	const {dbbyTable} = await connectMongo(config.mongo)
	const scheduleEventTable = dbbyTable<ScheduleEventRow>("scheduleEvents")

	const scheduleSentry = makeScheduleSentry({
		scheduleEventTable,
		authorize: verifyToken,
		userCanChangeSchedule: evaluators.isStaff,
	})

	const {koa: apiKoa} = await apiServer<ScheduleApi>({
		debug,
		logger,
		exposures: {
			scheduleSentry: {
				cors,
				exposed: scheduleSentry,
			},
		}
	})
	
	new Koa()
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})
	
	logger.info(`🌐 schedule-server on ${port}`)
})
