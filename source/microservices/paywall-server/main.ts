
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
import {nodeProgram} from "../../toolbox/node-program.js"
import {httpHandler} from "../../toolbox/http-handler.js"
import {connectMongo} from "../../toolbox/connect-mongo.js"
import {unpackCorsConfig} from "../../toolbox/unpack-cors-config.js"

import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {makeStripeLiaison} from "../../business/paywall/stripe-liaison.js"
import {makeCoreSystemsClients} from "../../business/core/core-clients.js"
import {makeStripeWebhooks} from "../../business/paywall/stripe-webhooks.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {makePremiumDatalayer} from "../../business/paywall/premium-datalayer.js"

import {CheckoutPopupSettings} from "./clientside/types.js"
import {PaywallServerConfig, PaywallApi, MetalUser, PremiumGiftRow, StripeBillingRow, StripePremiumRow, ClaimsRow} from "../../types.js"

nodeProgram(async function main({logger}) {
	const paths = {
		config: "metalback/config/config.yaml",
		authServerPublicKey: "metalback/config/auth-server.public.pem",
		templates: "source/microservices/paywall-server/clientside/templates",
	}
	const template = async(filename: string) => pug.compile(
		await read(`${paths.templates}/${filename}`)
	)
	const templates = {
		checkout: await template("checkout-popup.pug")
	}

	const config: PaywallServerConfig = await readYaml(paths.config)
	const {debug, authServerOrigin} = config
	const cors = unpackCorsConfig(config.cors)
	const {
		port,
		stripeApiKey,
		stripeSecret,
		premiumStripePlanId,
		stripeWebhooksSecret,
	} = config.paywallServer

	const authServerPublicKey = await read(paths.authServerPublicKey)
	const verifyToken = curryVerifyToken(authServerPublicKey)

	const {dbbyTable} = await connectMongo(config.mongo)
	const claimsTable = dbbyTable<ClaimsRow>("claims")
	const premiumGiftTable = dbbyTable<PremiumGiftRow>("premiumGift")
	const stripeBillingTable = dbbyTable<StripeBillingRow>("stripeBilling")
	const stripePremiumTable = dbbyTable<StripePremiumRow>("stripePremium")

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
		authorize: verifyToken,
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
})
