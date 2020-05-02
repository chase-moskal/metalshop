
import {SimpleConsole} from "../../../toolbox/logger.js"
import {pubsubs, pubsub} from "../../../toolbox/pubsub.js"
import {StripeWebhooks, AuthVanguardTopic, BillingDatalayer, SettingsDatalayer} from "../../../interfaces.js"

import {makeStripeWebhooks} from "../stripe-webhooks.js"
import {mockStripeDatalayer} from "./mock-stripe-datalayer.js"

/**
 * create a closed circuit mock of stripe's system
 * - create a mock stripe datalayer
 *   - to emulate stripe's backend
 *   - to trigger our webhook handlers
 * - instance our genuine stripe webhook implementation
 *   - to exercise our handling logic
 * - we use pubsub to work around the circular dependency here
 */
export function mockStripeCircuit({
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

	// give the publishers to the mock stripe datalayer
	const stripeDatalayer = mockStripeDatalayer({webhooks: webhookPublishers})

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

	return {stripeDatalayer, webhooks}
}
