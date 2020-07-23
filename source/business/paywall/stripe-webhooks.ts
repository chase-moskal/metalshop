
import {getStripeId} from "./helpers.js"
import {Stripe} from "../../commonjs/stripe.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {Logger} from "../../toolbox/logger/interfaces.js"

import {ClaimsCardinalTopic, StripeLiaison, StripeWebhooks, PremiumDatalayer, SetupMetadata, MetalUser} from "../../types.js"

export class StripeWebhookError extends Error {
	name = this.constructor.name
}

const err = (message: string) => new StripeWebhookError(message)

export function makeStripeWebhooks({
		logger,
		stripeLiaison,
		claimsCardinal,
		premiumDatalayer,
	}: {
		logger: Logger
		stripeLiaison: StripeLiaison
		premiumDatalayer: PremiumDatalayer
		claimsCardinal: ClaimsCardinalTopic<MetalUser>
	}): StripeWebhooks {

	function evaluateSubscription(subscription: Stripe.Subscription) {
		const active = false
			|| subscription.status === "active"
			|| subscription.status === "trialing"
			|| subscription.status === "past_due"
		return {
			active,
			stripeSubscriptionId: subscription.id,
			premiumUntil: active ? subscription.current_period_end : undefined,
			stripePaymentMethodId: getStripeId(subscription.default_payment_method),
		}
	}

	/**
	 * action to fulfill a purchased subscription
	 */
	async function fulfillSubscription({userId, session}: {
			userId: string
			session: Stripe.Checkout.Session
		}) {
		const stripeSubscriptionId = getStripeId(session.subscription)
		const details = await concurrent({
			subscription: stripeLiaison.fetchSubscriptionDetails(stripeSubscriptionId),
			payment: stripeLiaison.fetchPaymentDetailsBySubscriptionId(stripeSubscriptionId),
		})
		const {card} = details.payment
		const {expires} = details.subscription
		const premiumUntil = details.subscription.status === "active"
			? expires
			: undefined
		await Promise.all([
			premiumDatalayer.upsertStripePremiumRow(userId, {
				...card,
				userId,
				stripeSubscriptionId,
			}),
			claimsCardinal.writeClaims({
				userId,
				claims: {premiumUntil},
			}),
		])
	}

	/**
	 * action to update the payment method used on an active subscription
	 */
	async function updatePremiumSubscription({userId, session}: {
			userId: string
			session: Stripe.Checkout.Session
		}) {
		const {stripeSubscriptionId} = await premiumDatalayer.getStripePremiumRow(userId)
		const stripeIntentId = getStripeId(session.setup_intent)
		const {card, stripePaymentMethodId} = await stripeLiaison
			.fetchPaymentDetailsByIntentId(stripeIntentId)
		await stripeLiaison.updateSubscriptionPaymentMethod({
			stripePaymentMethodId,
			stripeSubscriptionId,
		})
		await premiumDatalayer.upsertStripePremiumRow(userId, {
			...card,
			userId,
			stripeSubscriptionId,
		})
	}

	/**
	 * action to unfulfill or refulfill expiring/canceled/defunct subscriptions
	 */
	async function respectSubscriptionChange({stripeCustomerId, subscription}: {
			stripeCustomerId: string
			subscription: Stripe.Subscription
		}) {

		const {userId} = await premiumDatalayer
			.getStripeBillingRowByStripeCustomerId(stripeCustomerId)
		const {premiumUntil, active} = evaluateSubscription(subscription)
		await claimsCardinal.writeClaims({userId, claims: {premiumUntil}})
		if (!active) await premiumDatalayer.deleteStripePremiumRow(userId)
	}

	//
	// stripe webhook responders
	//

	return {

		async ["checkout.session.completed"](event: Stripe.Event) {
			const session = <Stripe.Checkout.Session>event.data.object
			const userId = session.client_reference_id

			// checkout session has purchased a subscription
			if (session.mode === "subscription") {
				logger.debug(" - checkout in 'subscription' mode")
				await fulfillSubscription({userId, session})
			}

			// checkout session is in setup mode, no purchase is made
			else if (session.mode === "setup") {
				logger.debug(" - checkout in 'setup' mode")
				const metadata = <SetupMetadata>session.metadata
				if (metadata.flow === "UpdatePremiumSubscription") {
					logger.debug(` - flow "${metadata.flow}"`)
					await updatePremiumSubscription({userId, session})
				}
				else throw err(`unknown flow "${metadata.flow}"`)
			}

			// throw error on unsupported modes
			else throw err(`unknown session mode "${session.mode}"`)
		},

		async ["customer.subscription.updated"](event: Stripe.Event) {
			const subscription = <Stripe.Subscription>event.data.object
			const stripeCustomerId = getStripeId(subscription.customer)
			await respectSubscriptionChange({stripeCustomerId, subscription})
		},
	}
}
