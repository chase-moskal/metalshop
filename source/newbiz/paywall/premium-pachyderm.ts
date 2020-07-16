
import {PremiumPachydermTopic, PremiumDatalayer, StripeLiaison, AccessToken, AccessPayload, VerifyToken} from "../../types.js"

import {concurrent} from "../../toolbox/concurrent.js"

export function makePremiumPachyderm({
		verifyToken,
		stripeLiaison,
		premiumDatalayer,
		premiumStripePlanId,
	}: {
		verifyToken: VerifyToken
		premiumStripePlanId: string
		stripeLiaison: StripeLiaison
		premiumDatalayer: PremiumDatalayer
	}): PremiumPachydermTopic {

	async function verify(accessToken: AccessToken) {
		const {user, scope} = await verifyToken<AccessPayload>(accessToken)
		if (!scope.master) throw new Error("scope forbidden")
		return user
	}

	return {
		async getPremiumDetails({accessToken}) {
			const {userId} = await verify(accessToken)
			const row = await premiumDatalayer.getStripePremiumRow(userId)
			return row
				? {
					cardClues: {
						last4: row.last4,
						brand: row.brand,
						country: row.country,
						expireYear: row.expireYear,
						expireMonth: row.expireMonth,
					}
				}
				: undefined
		},

		async checkoutPremium({accessToken, popupUrl}) {
			const {userId} = await verify(accessToken)
			const {
				premiumGiftRow,
				stripeBillingRow,
				stripePremiumRow,
			} = await concurrent({
				stripeBillingRow: premiumDatalayer.assertStripeBillingRow(userId),
				stripePremiumRow: premiumDatalayer.getStripePremiumRow(userId),
				premiumGiftRow: premiumDatalayer.getPremiumGiftRow(userId),
			})

			const {stripeCustomerId} = stripeBillingRow
			if (premiumGiftRow) throw new Error("already gifted premium")
			if (stripePremiumRow) throw new Error("already subscribed to premium")

			// initiate a stripe checkout to purchase premium subscription
			const {stripeSessionId} = await stripeLiaison
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
			const {userId} = await verify(accessToken)
			const {
				stripeBillingRow,
				stripePremiumRow,
			} = await concurrent({
				stripeBillingRow: premiumDatalayer.assertStripeBillingRow(userId),
				stripePremiumRow: premiumDatalayer.getStripePremiumRow(userId),
			})

			if (!stripePremiumRow) throw new Error("no subscription to update")

			// initiate a stripe checkout to update existing subscription
			const {stripeSessionId} = await stripeLiaison.checkoutSubscriptionUpdate({
				userId,
				popupUrl,
				flow: "UpdatePremiumSubscription",
				stripeCustomerId: stripeBillingRow.stripeCustomerId,
				stripeSubscriptionId: stripePremiumRow.stripeSubscriptionId,
			})

			// our systems react to the associated stripe webhook
			return {stripeSessionId}
		},

		async cancelPremium({accessToken}) {
			const {userId} = await verify(accessToken)
			const stripePremiumRow = await premiumDatalayer.getStripePremiumRow(userId)
			if (!stripePremiumRow) throw new Error("no subscription to cancel")

			// schedule stripe to cancel the subscription at end of period
			await stripeLiaison.scheduleSubscriptionCancellation({
				stripeSubscriptionId: stripePremiumRow.stripeSubscriptionId
			})

			// our systems react to the associated stripe webhook
			return undefined
		},
	}
}
