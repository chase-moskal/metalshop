
import {VerifyToken} from "../../interfaces.js"
import {StripeLiaisonTopic, StripeDatalayer, AccessToken, AuthVanguardTopic, AccessPayload, BillingDatalayer} from "../../interfaces.js"

export function makeStripeLiaison({
		verifyToken,
		authVanguard,
		stripeDatalayer,
		billingDatalayer,
		premiumSubscriptionStripePlanId,
	}: {
		verifyToken: VerifyToken
		authVanguard: AuthVanguardTopic
		stripeDatalayer: StripeDatalayer
		billingDatalayer: BillingDatalayer
		premiumSubscriptionStripePlanId: string
	}): StripeLiaisonTopic {

	const internal = {

		/** verify a token and return the relevant access token */
		async getBillingRecord(accessToken: AccessToken) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user
			return await billingDatalayer.getRecord(userId)
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
			const {stripeSessionId} = await stripeDatalayer.createLinkingSession({
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
			const {stripeSessionId} = await stripeDatalayer.createSubscriptionSession({
				userId,
				popupUrl,
				stripeCustomerId,
				premiumSubscriptionStripePlanId,
			})
			return {stripeSessionId}
		},

		/**
		 * user wants to disable one-click payments
		 */
		async unlink({accessToken}: {accessToken: AccessToken}) {

			// update billing record and the stripe subscription
			const record = await internal.getBillingRecord(accessToken)
			record.stripePaymentMethodId = null
			if (record.premiumSubscription) {
				record.premiumSubscription.autoRenew = false
				const {stripeSubscriptionId} = record.premiumSubscription
				await stripeDatalayer.updateSubscriptionAutoRenew({
					autoRenew: false,
					stripeSubscriptionId,
				})
				await stripeDatalayer.updateSubscriptionPaymentMethod({
					stripeSubscriptionId,
					stripePaymentMethodId: null,
				})
			}
			await billingDatalayer.saveRecord(record)

			// set our user's billing claim
			const {claims} = await authVanguard.getUser({userId: record.userId})
			claims.billing = {
				...claims.billing,
				linked: false,
			}
			await authVanguard.setClaims({userId: record.userId, claims})
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
			await stripeDatalayer.updateSubscriptionAutoRenew({autoRenew, stripeSubscriptionId})

			// update our billing record
			record.premiumSubscription.autoRenew = autoRenew
			await billingDatalayer.saveRecord(record)
		},
	}
}
