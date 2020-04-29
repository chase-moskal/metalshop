
import {Stripe} from "../../commonjs/stripe.js"
import {SimpleConsole} from "../../toolbox/logger.js"
import {stripeGetId, getCardClues, getSubscriptionDetails} from "./stripe-helpers.js"
import {StripeDatalayer, BillingDatalayer, SettingsDatalayer, AuthVanguardTopic, StripeWebhooks, StripeSetupMetadata, StripeSetupMetadataUpdateSubscription} from "../../interfaces.js"

export function makeStripeWebhooks({
		logger,
		// stripe,
		authVanguard,
		stripeDatalayer,
		billingDatalayer,
		settingsDatalayer,
	}: {
		// stripe: Stripe
		logger: SimpleConsole
		authVanguard: AuthVanguardTopic
		stripeDatalayer: StripeDatalayer
		billingDatalayer: BillingDatalayer
		settingsDatalayer: SettingsDatalayer
	}): StripeWebhooks {

	const internal = {
		logEvent(event: Stripe.Event) {
			logger.debug("stripe webhook", event.type)
		},
		async setUserPremiumClaim({userId, premium}: {
			userId: string
			premium: boolean
		}) {
			const {claims} = await authVanguard.getUser({userId})
			claims.premium = premium
			await authVanguard.setClaims({userId, claims})
		},
	}

	return {

		/**
		 * customer saved a payment source and maybe purchased something
		 * - happens when a user links a card, for the sake of future payments
		 * - also happens when a user purchases a subscription or product
		 */
		async ["checkout.session.completed"](event: Stripe.Event): Promise<void> {
			internal.logEvent(event)
			const session = <Stripe.Checkout.Session>event.data.object
			const userId = session.client_reference_id

			// checkout was in setup mode, no purchase was made
			if (session.mode === "setup") {
				logger.debug(" - checkout in 'setup' mode")
				const metadata = <StripeSetupMetadata>session.metadata
				if (metadata.flow === "UpdateSubscription") {
					logger.debug(" - checkout setup in UpdateSubscription flow")
					const {stripeSubscriptionId} =
						<StripeSetupMetadataUpdateSubscription>metadata

					// obtain the payment method
					const stripeIntentId = stripeGetId(session.setup_intent)
					const stripePaymentMethod = await stripeDatalayer
						.fetchPaymentMethodByIntentId(stripeIntentId)

					// update the stripe subscription's payment method
					await stripeDatalayer.updateSubscriptionPaymentMethod({
						stripeSubscriptionId,
						stripePaymentMethodId: stripePaymentMethod.id,
					})

					// save our billing settings
					const settings = await settingsDatalayer.getOrCreateSettings(userId)
					const card = getCardClues(stripePaymentMethod)
					if (!card) throw new Error("card clues missing")
					settings.billing.premiumSubscription = {card}
					await settingsDatalayer.saveSettings(settings)

					logger.debug(" - subscription payment method updated ")
				}
				else {
					throw new Error("unknown setup flow")
				}
			}

			// customer purchased a subscription
			else if (session.mode === "subscription") {
				logger.debug(" - checkout in 'subscription' mode")
				const stripeSubscriptionId = stripeGetId(session.subscription)
				const {status, expires} = await stripeDatalayer
					.fetchSubscriptionDetails(stripeSubscriptionId)
				// if (!planActive) throw new Error("new subscription plan isn't active")

				// update our billing record
				const record = await billingDatalayer.getOrCreateRecord(userId)
				record.premiumStripeSubscriptionId = stripeSubscriptionId
				await billingDatalayer.setRecord(record)

				// update our premium claim
				await internal.setUserPremiumClaim({userId, premium: true})

				// update our settings
				const settings = await settingsDatalayer.getOrCreateSettings(userId)
				const stripePaymentMethod = await stripeDatalayer
					.fetchPaymentMethodBySubscriptionId(stripeSubscriptionId)
				const card = getCardClues(stripePaymentMethod)
				if (!card) throw new Error("card clues missing")
				settings.premium = {expires}
				settings.billing.premiumSubscription = {card}
				await settingsDatalayer.saveSettings(settings)

				logger.debug(" - new subscription saved")
			}

			// handle error
			else throw new Error("unknown session mode for stripe webhook "
				+ "'checkout.session.completed'")
		},

		/**
		 * subscription details have changed
		 * - perhaps payments failed and stripe ended the subscription
		 * - or maybe a subscription was reactived after successful payments
		 */
		async ["customer.subscription.updated"](
				event: Stripe.Event
			): Promise<void> {
			internal.logEvent(event)
			const subscription = <Stripe.Subscription>event.data.object
			const stripeSubscriptionId = subscription.id
			const stripeCustomerId = stripeGetId(subscription.customer)
			const record = await billingDatalayer
				.getRecordByStripeCustomerId(stripeCustomerId)
			const {status, expires} = getSubscriptionDetails(subscription)

			// TODO multiple subscription products?
			if (record.premiumStripeSubscriptionId !== stripeSubscriptionId)
				throw new Error("cannot update unknown subscription id")

			// TODO AHHH
			// const active = status === "active"
			// 	|| status === "trialing"
			// 	|| status === 

			if (!active) {

				// update our settings
				const settings = await settingsDatalayer
					.getOrCreateSettings(record.userId)
				settings.premium = null
				settings.billing.premiumSubscription = null
				await settingsDatalayer.saveSettings(settings)
	
				// update our claims
				await internal.setUserPremiumClaim({
					premium: false,
					userId: record.userId,
				})

				// update our billing record
				record.premiumStripeSubscriptionId = null
				await billingDatalayer.setRecord(record)
			}


			// record.premiumSubscription = active
			// 	? record.premiumSubscription || {
			// 		autoRenew: true,
			// 		stripeSubscriptionId,
			// 	}
			// 	: null

			// await billingDatalayer.saveRecord(record)
			// await internal.setUserPremiumClaim({
			// 	userId: record.userId,
			// 	premium: {expires: subscription.current_period_end},
			// })
		},
	}
}
