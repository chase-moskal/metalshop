
import {VerifyToken} from "../../interfaces.js"
import {StripeLiaisonTopic, StripeDatalayer, AccessToken, PaywallOverlordTopic, AccessPayload, BillingDatalayer} from "../../interfaces.js"

export function makeStripeLiaison({
		stripe,
		billing,
		verifyToken,
		paywallOverlord,
		premiumSubscriptionStripePlanId,
	}: {
		stripe: StripeDatalayer
		verifyToken: VerifyToken
		billing: BillingDatalayer
		paywallOverlord: PaywallOverlordTopic
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
		commonSessionParams: ({userId, popupUrl, stripeCustomerId}: {
				userId: string
				popupUrl: string
				stripeCustomerId: string
			}) => ({
			customer: stripeCustomerId,
			client_reference_id: userId,
			payment_method_types: ["card"],
			cancel_url: `${popupUrl}#cancel`,
			success_url: `${popupUrl}#success`,
		}),
	}

	return {

		/**
		 * user wants to link their credit card
		 * - create a session for the popup to proceed
		 * - completion is handled by stripe webhook
		 */
		async createSessionForLinking({popupUrl, accessToken}: {
				popupUrl: string
				accessToken: AccessToken
			}): Promise<{stripeSessionId: string}> {
			const {
				userId,
				stripeCustomerId,
			} = await internal.getBillingRecord(accessToken)
			const {stripeSessionId} = await stripe.createLinkingSession({
				userId,
				popupUrl,
				stripeCustomerId,
			})
			return {stripeSessionId}
		},

		/**
		 * user wants to sign up for a premium subscription
		 * - create a session for the popup to proceed
		 * - completion is handled by stripe webhook
		 */
		async createSessionForPremium({popupUrl, accessToken}: {
				popupUrl: string
				accessToken: AccessToken
			}): Promise<{stripeSessionId: string}> {
			const {
				userId,
				stripeCustomerId,
			} = await internal.getBillingRecord(accessToken)
			const {stripeSessionId} = await stripe.createSubscriptionSession({
				userId,
				popupUrl,
				stripeCustomerId,
				premiumSubscriptionStripePlanId,
			})
			return {stripeSessionId}
		},

		/**
		 * user wants to disable one-click payments
		 * - does not affect existing active subscriptions
		 */
		async unlinkPaymentMethod({accessToken}: {accessToken: AccessToken}) {
			const record = await internal.getBillingRecord(accessToken)
			record.stripePaymentMethodId = null
			await billing.saveRecord(record)
			await paywallOverlord.setUserBillingClaim({
				linked: false,
				userId: record.userId,
			})
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
			await stripe.updateSubscription({autoRenew, stripeSubscriptionId})

			// update our billing record
			record.premiumSubscription.autoRenew = autoRenew
			await billing.saveRecord(record)
		},
	}
}
