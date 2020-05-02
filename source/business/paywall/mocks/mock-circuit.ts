
import {SimpleConsole} from "../../../toolbox/logger.js"
import {pubsubs, pubsub, Pubsubs} from "../../../toolbox/pubsub.js"
import {StripeWebhooks, AuthVanguardTopic, BillingDatalayer, SettingsDatalayer} from "../../../interfaces.js"

import {makeStripeWebhooks} from "../stripe-webhooks.js"
import {mockStripeDatalayer} from "./mock-stripe-datalayer.js"

export function mockDatalayerWebhookCircuit({
		logger,
		authVanguard,
		billingDatalayer,
		settingsDatalayer,
	}: {
		logger: SimpleConsole
		authVanguard: AuthVanguardTopic
		billingDatalayer: BillingDatalayer
		settingsDatalayer: SettingsDatalayer
	}) {

	// create pubsub contexts for each webhook
	const {
		publishers: webhookPublishers,
		subscribers: webhookSubscribers,
	} = pubsubs<StripeWebhooks>({
		["checkout.session.completed"]: pubsub(),
		["customer.subscription.updated"]: pubsub(),
	})

	// creating a proxy of the webhooks
	const proxyWebhooks: StripeWebhooks = webhookPublishers

	// provide the stripe datalayer with the proxies
	const stripeDatalayer = mockStripeDatalayer({
		webhooks: proxyWebhooks
	})

	// create the real webhooks with a reference to the datalayer
	const webhooks = makeStripeWebhooks({
		logger,
		authVanguard,
		stripeDatalayer,
		billingDatalayer,
		settingsDatalayer,
	})

	// wire up the proxies to the real webhooks to create a loop
	for (const [key, subscribe] of Object.entries(webhookSubscribers)) {
		const webhook = webhooks[key].bind(webhooks)
		subscribe(webhook)
	}

	return {stripeDatalayer, webhooks}
}
