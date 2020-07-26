
import {getStripeId} from "./helpers.js"
import {Stripe} from "../../commonjs/stripe.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {Logger} from "../../toolbox/logger/interfaces.js"

import {ClaimsCardinalTopic, UserUmbrellaTopic, StripeLiaison, StripeWebhooks, PremiumDatalayer, SetupMetadata, MetalUser} from "../../types.js"

export class StripeWebhookError extends Error {
	name = this.constructor.name
}

const err = (message: string) => new StripeWebhookError(message)

function biggest(...args: number[]) {
	let x = 0
	for (const y of args) {
		if (y > x) x = y
	}
	return x
}

export function makeStripeWebhooks({
		logger,
		userUmbrella,
		stripeLiaison,
		claimsCardinal,
		premiumDatalayer,
	}: {
		logger: Logger
		stripeLiaison: StripeLiaison
		premiumDatalayer: PremiumDatalayer
		userUmbrella: UserUmbrellaTopic<MetalUser>
		claimsCardinal: ClaimsCardinalTopic<MetalUser>
	}): StripeWebhooks {

	async function evaluatePremium({
			userId,
			subscriptionEnd,
			subscriptionStatus,
		}: {
			userId: string
			subscriptionEnd: number
			subscriptionStatus: Stripe.Subscription.Status
		}) {

		const [user, gift] = await Promise.all([
			userUmbrella.getUser({userId}),
			premiumDatalayer.getPremiumGiftRow(userId),
		])

		const giftUntil = gift?.until || 0
		const previousPremiumUntil = user.claims.premiumUntil || 0

		const active = false
			|| subscriptionStatus === "active"
			|| subscriptionStatus === "trialing"
			|| subscriptionStatus === "past_due"

		const subscriptionUntil = active
			? subscriptionEnd || 0
			: 0

		// select the most generous premium timeframe
		const premiumUntil = biggest(
			giftUntil,
			subscriptionUntil,
			previousPremiumUntil,
		)

		return {active, premiumUntil}
	}

	/**
	 * action to fulfill a purchased subscription
	 */
	async function fulfillSubscription({userId, session}: {
			userId: string
			session: Stripe.Checkout.Session
		}) {
		const stripeSubscriptionId = getStripeId(session.subscription)
		const {subscription, payment} = await concurrent({
			subscription: stripeLiaison.fetchSubscriptionDetails(stripeSubscriptionId),
			payment: stripeLiaison.fetchPaymentDetailsBySubscriptionId(stripeSubscriptionId),
		})
		const {card} = payment

		const {premiumUntil} = await evaluatePremium({
			userId,
			subscriptionStatus: subscription.status,
			subscriptionEnd: subscription.current_period_end,
		})

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
		const {card, stripePaymentMethodId} = await stripeLiaison.fetchPaymentDetailsByIntentId(stripeIntentId)
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
		const {userId} = await premiumDatalayer.getStripeBillingRowByStripeCustomerId(stripeCustomerId)
		const {active, premiumUntil} = await evaluatePremium({
			userId,
			subscriptionStatus: subscription.status,
			subscriptionEnd: subscription.current_period_end,
		})
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
