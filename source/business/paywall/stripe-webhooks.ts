
import {getStripeId} from "./helpers.js"
import {Stripe} from "../../commonjs/stripe.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {BillingRecord, StripeDatalayer, SettingsDatalayer, AuthVanguardTopic, StripeWebhooks, SetupMetadata, BillingDatalayer} from "../../interfaces.js"

export class StripeWebhookError extends Error {
	name = this.constructor.name
}

const err = (message: string) => new StripeWebhookError(message)

export function makeStripeWebhooks({
		logger,
		authVanguard,
		stripeDatalayer,
		billingDatalayer,
		settingsDatalayer,
	}: {
		logger: Logger
		billingDatalayer: BillingDatalayer
		authVanguard: AuthVanguardTopic
		stripeDatalayer: StripeDatalayer
		settingsDatalayer: SettingsDatalayer
	}): StripeWebhooks {

	//
	// handy helpers
	//

	const getSubscriptionDetails = (subscription: Stripe.Subscription) => ({
		active: subscription.status === "active"
		|| subscription.status === "trialing"
		|| subscription.status === "past_due",
		stripeSubscriptionId: subscription.id,
		expires: subscription.current_period_end,
		stripePaymentMethodId: getStripeId(subscription.default_payment_method),
	})

	async function setUserPremiumClaim({userId, premium}: {
			userId: string
			premium: boolean
		}) {
		const {claims} = await authVanguard.getUser({userId})
		claims.premium = premium
		await authVanguard.setClaims({userId, claims})
	}

	//
	// logical actions
	//

	/**
	 * action to fulfill a purchased subscription
	 */
	async function fulfillSubscription({userId, session}: {
		userId: string
		session: Stripe.Checkout.Session
	}) {

		// get more info about the stripe subscription
		const stripeSubscriptionId = getStripeId(session.subscription)
		const {expires} = await stripeDatalayer
			.fetchSubscriptionDetails(stripeSubscriptionId)

		// update our billing record
		const record = await billingDatalayer.getOrCreateRecord(userId)
		record.premiumStripeSubscriptionId = stripeSubscriptionId
		await billingDatalayer.writeRecord(record)

		// update our premium claim
		await setUserPremiumClaim({userId, premium: true})

		// update our settings
		const settings = await settingsDatalayer.getOrCreateSettings(userId)
		const {card} = await stripeDatalayer
			.fetchPaymentDetailsBySubscriptionId(stripeSubscriptionId)
		if (!card) throw err("card clues missing")
		settings.premium = {expires}
		settings.billing.premiumSubscription = {card}
		await settingsDatalayer.saveSettings(settings)
	}

	/**
	 * action to update the payment method used on an active subscription
	 */
	async function updatePremiumSubscription({userId, session}: {
			userId: string
			session: Stripe.Checkout.Session
		}) {

		// obtain existing subscription id
		const {
			premiumStripeSubscriptionId,
		} = await billingDatalayer.getOrCreateRecord(userId)
		if (!premiumStripeSubscriptionId) throw err(`subscription id missing`)

		// obtain the payment method
		const stripeIntentId = getStripeId(session.setup_intent)
		const {
			card,
			stripePaymentMethodId,
		} = await stripeDatalayer.fetchPaymentDetailsByIntentId(stripeIntentId)
		if (!card) throw err("card clues missing")

		// update the stripe subscription's payment method
		await stripeDatalayer.updateSubscriptionPaymentMethod({
			stripePaymentMethodId,
			stripeSubscriptionId: premiumStripeSubscriptionId,
		})

		// save our billing settings
		const settings = await settingsDatalayer.getOrCreateSettings(userId)
		settings.billing.premiumSubscription = {card}
		await settingsDatalayer.saveSettings(settings)
	}

	/**
	 * action to unfulfill or refulfill expiring/canceled/defunct subscriptions
	 */
	async function respectSubscriptionChange({record, subscription}: {
			record: BillingRecord
			subscription: Stripe.Subscription
		}) {

		const {userId} = record
		const {
			active,
			expires,
			stripePaymentMethodId,
		} = getSubscriptionDetails(subscription)
		if (active) {

			// set our user's claim
			setUserPremiumClaim({userId, premium: true})

			// set our billing settings
			const settings = await settingsDatalayer.getOrCreateSettings(userId)
			const {card} = await stripeDatalayer
				.fetchPaymentDetails(stripePaymentMethodId)
			settings.premium = {expires}
			settings.billing.premiumSubscription = {card}
			await settingsDatalayer.saveSettings(settings)
		}
		else {
			const premium = Date.now() < expires

			// set our user's claim
			setUserPremiumClaim({userId, premium})

			// set our billing settings
			const settings = await settingsDatalayer.getOrCreateSettings(userId)
			settings.premium = premium ? {expires} : null
			settings.billing.premiumSubscription = null
			await settingsDatalayer.saveSettings(settings)

			// set our billing record
			record.premiumStripeSubscriptionId = null
			await billingDatalayer.writeRecord(record)
		}
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
			const record = await billingDatalayer
				.getRecordByStripeCustomerId(stripeCustomerId)
			await respectSubscriptionChange({record, subscription})
		},
	}
}
