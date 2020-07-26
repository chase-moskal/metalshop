
import {MetalUser, StripeWebhooks, PremiumGiftRow, StripeBillingRow, StripePremiumRow, ClaimsCardinalTopic, UserUmbrellaTopic} from "../../../types.js"

import {DbbyTable} from "../../../toolbox/dbby/types.js"
import {pubsubs, pubsub} from "../../../toolbox/pubsub.js"
import {Logger} from "../../../toolbox/logger/interfaces.js"

import {makeStripeWebhooks} from "../stripe-webhooks.js"
import {makePremiumDatalayer} from "../premium-datalayer.js"

import {mockStripeLiaison} from "./mock-stripe-liaison.js"

/**
 * create a closed circuit mock of stripe's system
 * - create a mock stripe liaison
 *   - to emulate stripe's backend
 *   - to trigger our webhook handlers
 * - instance our genuine stripe webhook implementation
 *   - to exercise our handling logic
 * - we use pubsub to defeat the circular dependency here
 */
export function mockStripeCircuit({
		logger,
		userUmbrella,
		claimsCardinal,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
	}: {
		logger: Logger
		userUmbrella: UserUmbrellaTopic<MetalUser>
		premiumGiftTable: DbbyTable<PremiumGiftRow>
		stripeBillingTable: DbbyTable<StripeBillingRow>
		stripePremiumTable: DbbyTable<StripePremiumRow>
		claimsCardinal: ClaimsCardinalTopic<MetalUser>
	}) {

	// create pubsub contexts for each webhook
	const {
		publishers: webhookPublishers,
		subscribers: webhookSubscribers,
	} = pubsubs<StripeWebhooks>({
		["checkout.session.completed"]: pubsub(),
		["customer.subscription.updated"]: pubsub(),
	})

	// give the publishers to the mock stripe liaison
	const stripeLiaison = mockStripeLiaison({webhooks: webhookPublishers})
	const premiumDatalayer = makePremiumDatalayer({
		stripeLiaison,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
	})

	// now create the a genuine webhooks instance which uses mocks
	const webhooks = makeStripeWebhooks({
		logger,
		userUmbrella,
		stripeLiaison,
		claimsCardinal,
		premiumDatalayer,
	})

	// finally register each genuine webhook as a subscriber to the pubsub
	for (const [key, subscribe] of Object.entries(webhookSubscribers)) {
		subscribe(webhooks[key].bind(webhooks))
	}

	return {stripeLiaison, premiumDatalayer, webhooks}
}
