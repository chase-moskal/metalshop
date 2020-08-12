
import {apiServer} from "renraku/dist/api-server.js"
import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import Koa from "../../commonjs/koa.js"
import * as pug from "../../commonjs/pug.js"
import Stripe from "../../commonjs/stripe.js"
import mount from "../../commonjs/koa-mount.js"
import serve from "../../commonjs/koa-static.js"
import koaCors from "../../commonjs/koa-cors.js"
import bodyParser from "../../commonjs/koa-bodyparser.js"

import {health} from "../../toolbox/health.js"
import {read, readYaml} from "../../toolbox/reading.js"
import {DbbyRow} from "../../toolbox/dbby/dbby-types.js"
import {httpHandler} from "../../toolbox/http-handler.js"
import {dbbyMongo} from "../../toolbox/dbby/dbby-mongo.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"
import {deathWithDignity} from "../../toolbox/death-with-dignity.js"
import {makeNodeLogger} from "../../toolbox/logger/make-node-logger.js"

import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {makeStripeLiaison} from "../../business/paywall/stripe-liaison.js"
import {makeCoreSystemsClients} from "../../business/core/core-clients.js"
import {makeStripeWebhooks} from "../../business/paywall/stripe-webhooks.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {makePremiumDatalayer} from "../../business/paywall/premium-datalayer.js"
import {PaywallServerConfig, PaywallApi, MetalUser, PremiumGiftRow, StripeBillingRow, StripePremiumRow, ClaimsRow} from "../../types.js"

import {CheckoutPopupSettings} from "./clientside/types.js"

const logger = makeNodeLogger()
deathWithDignity({logger})

const paths = {
	config: "metalback/config/config.yaml",
	authServerPublicKey: "metalback/config/auth-server.public.pem",
	templates: "source/microservices/paywall-server/clientside/templates",
	clientsideDist: "dist/microservices/paywall-server/clientside"
}

const getTemplate = async(filename: string) => pug.compile(
	await read(`${paths.templates}/${filename}`)
)

~async function main() {
	const config: PaywallServerConfig = await readYaml(paths.config)
	const {debug} = config
	const authServerPublicKey = await read(paths.authServerPublicKey)
	const cors = unpackCorsConfig(config.cors)
	const verifyAuthToken = curryVerifyToken(authServerPublicKey)
	const database = await connectMongo(config.mongo)
	const templates = {
		checkout: await getTemplate("checkout-popup.pug")
	}
	const {
		port,
		stripeApiKey,
		stripeSecret,
		authServerOrigin,
		premiumStripePlanId,
		stripeWebhooksSecret,
	} = config.paywallServer

	const table = <Row extends DbbyRow>(label: string) => dbbyMongo<Row>({
		collection: database.collection(label)
	})
	const claimsTable = table<ClaimsRow>("claims")
	const premiumGiftTable = table<PremiumGiftRow>("premiumGift")
	const stripeBillingTable = table<StripeBillingRow>("stripeBilling")
	const stripePremiumTable = table<StripePremiumRow>("stripePremium")

	const stripe = new Stripe(stripeSecret, {apiVersion: "2020-03-02"})
	const stripeLiaison = makeStripeLiaison({stripe})

	const {userUmbrella} = await makeCoreSystemsClients<MetalUser>({
		coreServerOrigin: authServerOrigin
	})

	const claimsCardinal = makeClaimsCardinal({claimsTable})

	const premiumDatalayer = makePremiumDatalayer({
		stripeLiaison,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
	})

	const premiumPachyderm = makePremiumPachyderm({
		stripeLiaison,
		premiumDatalayer,
		premiumStripePlanId,
		authorize: verifyAuthToken,
	})

	const stripeWebhooks = makeStripeWebhooks({
		logger,
		userUmbrella,
		stripeLiaison,
		claimsCardinal,
		premiumDatalayer,
	})

	const clientsideKoa = new Koa()
		.use(httpHandler("get", "/checkout", async() => {
			logger.log("checkout")
			return templates.checkout({
				settings: <CheckoutPopupSettings>{
					stripeApiKey,
					cors: config.cors,
					premiumStripePlanId,
				},
			})
		}))

	const stripeWebhooksKoa = new Koa()
		.use(bodyParser())
		.use(async context => {
			try {
				const {rawBody} = context.request
				const {["stripe-signature"]: signature} = context.request.headers
				const event = stripe.webhooks.constructEvent(
					rawBody,
					signature,
					stripeWebhooksSecret,
				)
				const webhook = stripeWebhooks[event.type]
				await webhook(event)
				context.status = 200
				context.body = ""
			}
			catch (error) {
				logger.error(error)
				context.status = 500
				context.body = "webhook error"
			}
		})

	const {koa: apiKoa} = await apiServer<PaywallApi>({
		debug,
		logger,
		exposures: {
			premiumPachyderm: {
				cors,
				exposed: premiumPachyderm,
			},
		}
	})

	// compose middlewares into the final server
	new Koa()
		.use(koaCors())
		.use(health({logger}))
		.use(mount(clientsideKoa))
		.use(serve("dist"))
		.use(mount("/node_modules", serve("node_modules")))
		.use(mount("/stripe/webhooks", stripeWebhooksKoa))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 paywall-server on ${port}`)

}().catch(error => logger.error(error))
