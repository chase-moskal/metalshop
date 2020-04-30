
import {VerifyToken} from "../../interfaces.js"
import {StripeLiaisonTopic, StripeDatalayer, AccessToken, AccessPayload, BillingDatalayer} from "../../interfaces.js"

export function makeStripeLiaison({
		verifyToken,
		stripeDatalayer,
		billingDatalayer,
		premiumStripePlanId,
	}: {
		verifyToken: VerifyToken
		premiumStripePlanId: string
		stripeDatalayer: StripeDatalayer
		billingDatalayer: BillingDatalayer
	}): StripeLiaisonTopic {

	const internal = {
		async verify(accessToken: AccessToken) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			return user
		},
	}

	return {
		async checkoutPremium({accessToken, popupUrl}) {
			const {userId} = await internal.verify(accessToken)
			const {stripeCustomerId} = await billingDatalayer
				.getOrCreateRecord(userId)

			// initiate a stripe checkout to purchase premium subscription
			const {stripeSessionId} = await stripeDatalayer
				.checkoutSubscriptionPurchase({
					userId,
					popupUrl,
					stripeCustomerId,
					stripePlanId: premiumStripePlanId,
				})

			// our systems react to the associated stripe webhook
			return {stripeSessionId}
		},

		async updatePremium({accessToken, popupUrl}) {
			const {userId} = await internal.verify(accessToken)
			const {
				stripeCustomerId,
				premiumStripeSubscriptionId,
			} = await billingDatalayer.getOrCreateRecord(userId)
			if (!premiumStripeSubscriptionId)
				throw new Error("no subscription id to update")

			// initiate a stripe checkout to update existing subscription
			const {stripeSessionId} = await stripeDatalayer
				.checkoutSubscriptionUpdate({
					userId,
					popupUrl,
					stripeCustomerId,
					flow: "UpdatePremiumSubscription",
					stripeSubscriptionId: premiumStripeSubscriptionId,
				})

			// our systems react to the associated stripe webhook
			return {stripeSessionId}
		},

		async cancelPremium({accessToken}) {
			const {userId} = await internal.verify(accessToken)
			const {premiumStripeSubscriptionId} = await billingDatalayer
				.getOrCreateRecord(userId)
			if (!premiumStripeSubscriptionId)
				throw new Error("no subscription to cancel")

			// schedule stripe to cancel the subscription at end of period
			await stripeDatalayer.scheduleSubscriptionCancellation({
				stripeSubscriptionId: premiumStripeSubscriptionId
			})

			// our systems react to the associated stripe webhook
			return undefined
		},
	}
}
