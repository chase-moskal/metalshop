
import Koa from "../../commonjs/koa.js"
import * as pug from "../../commonjs/pug.js"
import cors from "../../commonjs/koa-cors.js"
import mount from "../../commonjs/koa-mount.js"
import serve from "../../commonjs/koa-static.js"

import {apiServer} from "renraku/dist/api-server.js"
import {currySignToken} from "redcrypto/dist/curries/curry-sign-token.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {httpHandler} from "../../toolbox/http-handler.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {makeLogger} from "../../toolbox/logger/make-logger.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"
import {deathWithDignity} from "../../toolbox/death-with-dignity.js"

import {makeCoreSystems} from "../../business/core/core-systems.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {curryVerifyGoogleToken} from "../../business/core/verify-google-token.js"

import {VaultSettings} from "./clientside/types.js"
import {CoreSystemsApi, CoreSecuredApi, AuthServerConfig} from "../../types.js"

const logger = makeLogger()
deathWithDignity({logger})

const paths = {
	config: "config/config.yaml",
	publicKey: "config/auth-server.public.pem",
	privateKey: "config/auth-server.private.pem",
}

const getTemplate = async(filename: string) =>
	pug.compile(await read(`source/clientside/templates/${filename}`))

~async function main() {

	// // config, token keys, and database
	// const config: AuthServerConfig = await readYaml(paths.config)
	// const {debug} = config
	// const {port} = config.authServer
	// const publicKey = await read(paths.publicKey)
	// const privateKey = await read(paths.privateKey)
	// const database = await connectMongo(config.mongo)
	// const usersCollection = database.collection("users")
	// const profilesCollection = database.collection("profiles")

	// // generate a genuine profile magistrate
	// const profileMagistrate = makeProfileMagistrate({
	// 	verifyToken: curryVerifyToken(publicKey),
	// 	profileDatalayer: mongoProfileDatalayer({collection: profilesCollection}),
	// })

	// // generate auth-vanguard and the lesser auth-dealer
	// const userDatalayer = mongoUserDatalayer(usersCollection)
	// const {authVanguard, authDealer} = makeAuthVanguard({userDatalayer})

	// // prepare token signers and verifiers
	// const signToken = currySignToken(privateKey)
	// const verifyToken = curryVerifyToken(publicKey)
	// const verifyGoogleToken = curryVerifyGoogleToken(
	// 	config.authServer.googleClientId
	// )

	// // create the auth exchanger
	// const authExchanger = makeAuthExchanger({
	// 	signToken,
	// 	verifyToken,
	// 	authVanguard,
	// 	profileMagistrate,
	// 	verifyGoogleToken,
	// 	generateRandomNickname: () => generateName(),
	// 	accessTokenExpiresMilliseconds: 20 * (60 * 1000), // twenty minutes
	// 	refreshTokenExpiresMilliseconds: 60 * (24 * 60 * 60 * 1000), // sixty days
	// })

	// //
	// // html clientside
	// //

	// const templates = {
	// 	vault: await getTemplate("vault.pug"),
	// 	account: await getTemplate("account.pug"),
	// }

	// const htmlKoa = new Koa()
	// 	.use(cors())

	// 	// vault is a service in an iframe for cross-domain storage
	// 	.use(httpHandler("get", "/vault", async() => {
	// 		logger.log(`html /vault`)
	// 		const settings: VaultSettings = {cors: config.cors}
	// 		return templates.vault({settings})
	// 	}))

	// 	// account popup facilitates oauth routines
	// 	.use(httpHandler("get", "/account", async() => {
	// 		logger.log(`html /account`)
	// 		const settings: AccountSettings = {
	// 			debug,
	// 			cors: config.cors,
	// 			googleAuthDetails: {clientId: config.authServer.googleClientId}
	// 		}
	// 		return templates.account({settings})
	// 	}))

	// 	// serving the static clientside files
	// 	.use(serve("dist/clientside"))

	// //
	// // json rpc api
	// //

	// const {koa: apiKoa} = await apiServer<AuthApi>({
	// 	debug,
	// 	logger,
	// 	exposures: {
	// 		authExchanger: {
	// 			exposed: authExchanger,
	// 			cors: unpackCorsConfig(config.cors)
	// 		},
	// 		authVanguard: {
	// 			exposed: authVanguard,
	// 			whitelist: {}
	// 		},
	// 		authDealer: {
	// 			exposed: authDealer,
	// 			cors: unpackCorsConfig(config.cors)
	// 		},
	// 	}
	// })

	// //
	// // mount up the koa parts and run the server
	// //

	// new Koa()

	// 	// simple health check
	// 	.use(health({logger}))

	// 	// mount html for account popup and token storage
	// 	.use(mount("/html", htmlKoa))

	// 	// serve node_modules for local dev
	// 	.use(mount("/node_modules", new Koa()
	// 		.use(cors())
	// 		.use(serve("node_modules"))
	// 	))

	// 	// auth api
	// 	.use(mount("/api", apiKoa))

	// 	// start the server
	// 	.listen({host: "0.0.0.0", port})

	// logger.info(`🌐 auth-server on ${port}`)

}().catch(error => logger.error(error))
