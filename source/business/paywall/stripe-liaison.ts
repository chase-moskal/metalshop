
import {Stripe} from "../../commonjs/stripe.js"
import {VerifyToken} from "../../interfaces.js"
import {StripeLiaisonTopic, AccessToken, AccessPayload, BillingDatalayer} from "../../interfaces.js"

export function makeStripeLiaison({
		stripe,
		billing,
		verifyToken,
		premiumSubscriptionStripePlanId,
	}: {
		stripe: Stripe
		verifyToken: VerifyToken
		billing: BillingDatalayer
		premiumSubscriptionStripePlanId: string
	}): StripeLiaisonTopic {

	const internal = {

		/** verify a token and return the relevant access token */
		async getBillingRecord(accessToken: AccessToken) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user
			return await billing.getRecord(userId)
		},

		/** generate common stripe checkout session parameters */
		commonSessionParams({userId, popupUrl, stripeCustomerId}: {
				userId: string
				popupUrl: string
				stripeCustomerId: string
			}): Stripe.Checkout.SessionCreateParams {
			return {
				customer: stripeCustomerId,
				client_reference_id: userId,
				payment_method_types: ["card"],
				cancel_url: `${popupUrl}#cancel`,
				success_url: `${popupUrl}#success`,
			}
		},
	}

	return {

		/**
		 * user wants to link their credit card
		 * - create a session for the popup to proceed
		 */
		async createSessionForLinking({popupUrl, accessToken}: {
				popupUrl: string
				accessToken: AccessToken
			}): Promise<{stripeSessionId: string}> {
			const {userId, stripeCustomerId} = await internal.getBillingRecord(accessToken)
			const session = await stripe.checkout.sessions.create({
				...internal.commonSessionParams({
					userId,
					popupUrl,
					stripeCustomerId,
				}),
				mode: "setup",
			})
			return {stripeSessionId: session.id}
		},

		/**
		 * user wants to sign up for a premium subscription
		 * - create a session for the popup to proceed
		 */
		async createSessionForPremium({popupUrl, accessToken}: {
				popupUrl: string
				accessToken: AccessToken
			}): Promise<{stripeSessionId: string}> {
			const {userId, stripeCustomerId} = await internal.getBillingRecord(accessToken)
			const session = await stripe.checkout.sessions.create({
				...internal.commonSessionParams({
					userId,
					popupUrl,
					stripeCustomerId,
				}),
				mode: "subscription",
				payment_intent_data: {setup_future_usage: "off_session"},
				subscription_data: {items: [{plan: premiumSubscriptionStripePlanId}]},
			})
			return {stripeSessionId: session.id}
		},

		/**
		 * user wants to disable one-click payments
		 * - does not affect existing active subscriptions
		 */
		async unlinkPaymentMethod({accessToken}: {accessToken: AccessToken}) {
			const record = await internal.getBillingRecord(accessToken)
			record.stripePaymentMethodId = null
			await billing.saveRecord(record)
		},

		/**
		 * user toggles auto-renew setting on their premium subscription
		 * - cancel or uncancel the stripe subscription
		 */
		async setPremiumAutoRenew({autoRenew, accessToken}: {
				autoRenew: boolean
				accessToken: string
			}) {
			const record = await internal.getBillingRecord(accessToken)
			const {premiumSubscription} = record
			if (!premiumSubscription) throw new Error("no premium subscription")
			const {stripeSubscriptionId} = premiumSubscription

			// tell stripe about the new autorenew state
			await stripe.subscriptions.update(
				stripeSubscriptionId,
				{cancel_at_period_end: !autoRenew}
			)

			// update our billing record
			record.premiumSubscription.autoRenew = autoRenew
			await billing.saveRecord(record)
		},
	}
}
