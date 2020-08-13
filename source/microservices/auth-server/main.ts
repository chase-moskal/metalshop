
import Koa from "../../commonjs/koa.js"
import * as pug from "../../commonjs/pug.js"
import mount from "../../commonjs/koa-mount.js"
import serve from "../../commonjs/koa-static.js"
import koaCors from "../../commonjs/koa-cors.js"

import {apiServer} from "renraku/dist/api-server.js"
import {currySignToken} from "redcrypto/dist/curries/curry-sign-token.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {httpHandler} from "../../toolbox/http-handler.js"
import {nodeProgram} from "../../toolbox/node-program.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"

import {makeCoreSystems} from "../../business/core/core-systems.js"
import {validateProfile} from "../../business/core/validate-profile.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {curryGenerateNickname} from "../../business/core/generate-nickname.js"
import {curryVerifyGoogleToken} from "../../business/core/verify-google-token.js"

import {VaultSettings, AccountSettings} from "./clientside/types.js"
import {CoreSystemsApi, MetalUser, AuthServerConfig, ClaimsRow, AccountRow, ProfileRow} from "../../types.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "metalback/config/config.yaml",
		publicKey: "metalback/config/auth-server.public.pem",
		privateKey: "metalback/config/auth-server.private.pem",
		templates: "source/microservices/auth-server/clientside/templates",
	}
	const template = async(filename: string) => pug.compile(
		await read(`${paths.templates}/${filename}`)
	)
	const templates = {
		vault: await template("vault.pug"),
		account: await template("account.pug"),
	}

	const config: AuthServerConfig = await readYaml(paths.config)
	const {debug} = config
	const cors = unpackCorsConfig(config.cors)
	const {
		port,
		googleClientId,
		nicknameStructure,
		accessTokenLifespan,
		refreshTokenLifespan,
	} = config.authServer

	const publicKey = await read(paths.publicKey)
	const privateKey = await read(paths.privateKey)
	const signToken = currySignToken(privateKey)
	const verifyToken = curryVerifyToken(publicKey)
	const verifyGoogleToken = curryVerifyGoogleToken(googleClientId)

	const {dbbyTable} = await connectMongo(config.mongo)
	const claimsTable = dbbyTable<ClaimsRow>("claims")
	const accountTable = dbbyTable<AccountRow>("accounts")
	const profileTable = dbbyTable<ProfileRow>("profiles")

	const claimsCardinal = makeClaimsCardinal({claimsTable})
	const {authAardvark, userUmbrella} = makeCoreSystems({
		claimsTable,
		accountTable,
		profileTable,
		accessTokenLifespan,
		refreshTokenLifespan,
		signToken,
		verifyToken,
		validateProfile,
		verifyGoogleToken,
		generateNickname: curryGenerateNickname({
			delimiter: " ",
			nicknameStructure,
		}),
	})

	//
	// html clientside
	//

	const popupKoa = new Koa()

		// vault is a service in an iframe for cross-domain storage
		.use(httpHandler("get", "/vault", async() => {
			logger.log(`/vault`)
			const settings: VaultSettings = {cors: config.cors}
			return templates.vault({settings})
		}))

		// account popup facilitates oauth routines
		.use(httpHandler("get", "/account", async() => {
			logger.log(`/account`)
			const settings: AccountSettings = {
				debug,
				cors: config.cors,
				googleAuthDetails: {clientId: config.authServer.googleClientId}
			}
			return templates.account({settings})
		}))

	//
	// json rpc api
	//

	const {koa: apiKoa} = await apiServer<CoreSystemsApi<MetalUser>>({
		debug,
		logger,
		exposures: {
			userUmbrella: {
				cors,
				exposed: userUmbrella,
			},
			authAardvark: {
				cors,
				exposed: authAardvark,
			},
		},
	})

	//
	// mount up the koa parts and run the server
	//

	new Koa()
		.use(koaCors())
		.use(health({logger}))
		.use(mount(popupKoa))
		.use(serve("dist"))
		.use(mount("/node_modules", serve("node_modules")))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 auth-server on ${port}`)
})