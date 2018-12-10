
import * as Koa from "koa"
import * as KoaRouter from "koa-router"

import * as crypto from "./toolbox/crypto"
import {AuthRouterOptions, AuthServerOptions} from "./interfaces"

export async function createAuthRouter({
	secretKey,
	tokenExpiresIn,
	getAuthPayload
}: AuthRouterOptions) {
	const router = new KoaRouter()

	router.get("/auth2", async({request, response}) => {

		// obtain google token

		// verify google token and extract google id

		// create or obtain user payload with google account link

		// sign our user's token

		// respond with the token
	})

	router.get("/auth", async({request, response}) => {
		const authPayload = await getAuthPayload()

		// sign an access token with payload
		const token = await crypto.signToken({
			secretKey,
			payload: authPayload,
			expiresIn: tokenExpiresIn
		})

		// verify the token and extract the payload
		const payload2 = await crypto.verifyToken({token, secretKey})
		console.log("payload2", payload2)

		// respond with the token
		response.body = token
	})

	return router
}

export async function createAuthServer({
	port,
	...routerOptions
}: AuthServerOptions) {
	const server = new Koa()
	const authRouter = await createAuthRouter(routerOptions)
	server.use(authRouter.routes())
	server.use(authRouter.allowedMethods())
	server.listen(port)
	return server
}
