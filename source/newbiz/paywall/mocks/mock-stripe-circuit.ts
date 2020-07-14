
import {pubsubs, pubsub} from "../../../toolbox/pubsub.js"
import {Logger} from "../../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../../toolbox/dbby/dbby-memory.js"
import {StripeWebhooks, AuthVanguardTopic, SettingsDatalayer} from "../../../interfaces.js"

import {makeStripeWebhooks} from "../stripe-webhooks.js"
import {makeBillingDatalayer} from "../billing-datalayer.js"
import {mockStripeDatalayer} from "./mock-stripe-datalayer.js"

/**
 * create a closed circuit mock of stripe's system
 * - create a mock stripe datalayer
 *   - to emulate stripe's backend
 *   - to trigger our webhook handlers
 * - instance our genuine stripe webhook implementation
 *   - to exercise our handling logic
 * - we use pubsub to work around the circular dependency here
 * - we also create a mock billing datalayer
 */
export function mockStripeCircuit({
		logger,
		authVanguard,
		settingsDatalayer,
	}: {
		logger: Logger
		authVanguard: AuthVanguardTopic
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

	// give the publishers to the mock stripe datalayer
	const stripeDatalayer = mockStripeDatalayer({webhooks: webhookPublishers})
	const billingDatalayer = makeBillingDatalayer({
		stripeDatalayer,
		billingTable: dbbyMemory(),
	})

	// now create the a genuine webhooks instance which uses mocks
	const webhooks = makeStripeWebhooks({
		logger,
		authVanguard,
		stripeDatalayer,
		billingDatalayer,
		settingsDatalayer,
	})

	// finally register each genuine webhook as a subscriber to the pubsub
	for (const [key, subscribe] of Object.entries(webhookSubscribers)) {
		subscribe(webhooks[key].bind(webhooks))
	}

	return {stripeDatalayer, billingDatalayer, webhooks}
}
