
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

import {SettingsServerConfig, SettingsApi, SettingsRow} from "../../types.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "metalback/config/config.yaml",
		authServerPublicKey: "metalback/config/auth-server.public.pem",
	}

	const config: SettingsServerConfig = await readYaml(paths.config)
	const {debug, authServerOrigin} = config
	const {port} = config.settingsServer
	const cors = unpackCorsConfig(config.cors)

	const authServerPublicKey = await read(paths.authServerPublicKey)
	const verifyToken = curryVerifyToken(authServerPublicKey)

	const {dbbyTable} = await connectMongo(config.mongo)
	const settingsTable = dbbyTable<SettingsRow>("settings")

	const settingsSheriff = makeSettingsSheriff({
		settingsTable,
		authorize: verifyToken,
	})

	const {koa: apiKoa} = await apiServer<SettingsApi>({
		debug,
		logger,
		exposures: {
			settingsSheriff: {
				cors,
				exposed: settingsSheriff,
			},
		}
	})
	
	new Koa()
		.use(koaCors())
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})
	
	logger.info(`🌐 settings-server on ${port}`)
})
