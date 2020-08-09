
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
import {dbbyMongo} from "../../toolbox/dbby/dbby-mongo.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"
import {deathWithDignity} from "../../toolbox/death-with-dignity.js"
import {makeNodeLogger} from "../../toolbox/logger/make-node-logger.js"

import {makeCoreSystems} from "../../business/core/core-systems.js"
import {validateProfile} from "../../business/core/validate-profile.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {curryGenerateNickname} from "../../business/core/generate-nickname.js"
import {curryVerifyGoogleToken} from "../../business/core/verify-google-token.js"

import {VaultSettings, AccountSettings} from "./clientside/types.js"
import {CoreSystemsApi, MetalUser, AuthServerConfig, ClaimsRow, AccountRow, ProfileRow} from "../../types.js"

const logger = makeNodeLogger()
deathWithDignity({logger})

const paths = {
	config: "metalback/config/config.yaml",
	publicKey: "metalback/config/auth-server.public.pem",
	privateKey: "metalback/config/auth-server.private.pem",
	clientsideDist: "dist/microservices/auth-server/clientside",
	clientsideSource: "source/microservices/auth-server/clientside",
}

const getTemplate = async(filename: string) => pug.compile(
	await read(`${paths.clientsideSource}/templates/${filename}`)
)

~async function main() {

	logger.debug("loading config")
	const config: AuthServerConfig = await readYaml(paths.config)
	const {debug} = config
	const {
		port,
		googleClientId,
		nicknameStructure,
		accessTokenLifespan,
		refreshTokenLifespan,
	} = config.authServer

	logger.debug("loading tokens")
	const publicKey = await read(paths.publicKey)
	const privateKey = await read(paths.privateKey)

	logger.debug("connecting to database")
	const database = await connectMongo(config.mongo)
	const collection = (name: string) => ({collection: database.collection(name)})
	const claimsTable = dbbyMongo<ClaimsRow>(collection("claims"))
	const accountTable = dbbyMongo<AccountRow>(collection("accounts"))
	const profileTable = dbbyMongo<ProfileRow>(collection("profiles"))

	logger.debug("curry functions")
	const signToken = currySignToken(privateKey)
	const verifyToken = curryVerifyToken(publicKey)
	const verifyGoogleToken = curryVerifyGoogleToken(googleClientId)

	logger.debug("create business objects")
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

	logger.debug("html clientside")

	const templates = {
		vault: await getTemplate("vault.pug"),
		account: await getTemplate("account.pug"),
	}

	const htmlKoa = new Koa()
		.use(koaCors())

		// vault is a service in an iframe for cross-domain storage
		.use(httpHandler("get", "/vault", async() => {
			logger.log(`html /vault`)
			const settings: VaultSettings = {cors: config.cors}
			return templates.vault({settings})
		}))

		// account popup facilitates oauth routines
		.use(httpHandler("get", "/account", async() => {
			logger.log(`html /account`)
			const settings: AccountSettings = {
				debug,
				cors: config.cors,
				googleAuthDetails: {clientId: config.authServer.googleClientId}
			}
			return templates.account({settings})
		}))

		// serving the static clientside files
		.use(serve(paths.clientsideDist))

	//
	// json rpc api
	//

	logger.debug("json rpc api")

	const cors = unpackCorsConfig(config.cors)
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

	logger.debug("assemble and start server")

	new Koa()

		// simple health check
		.use(health({logger}))

		// mount html for account popup and token storage
		.use(mount("/html", htmlKoa))

		// serve node_modules for local dev
		.use(mount("/node_modules", new Koa()
			.use(koaCors())
			.use(serve("node_modules"))
		))

		// auth api
		.use(mount("/api", apiKoa))

		// start the server
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 auth-server on ${port}`)

}().catch(error => logger.error(error))
