
import {User, PaywallPachydermTopic, ClaimsCardinalTopic, StripeLiaison, AccessToken, AccessPayload, StripeBillingRow, StripePremiumRow, PremiumGiftRow, VerifyToken} from "../../types.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"

export function makePaywallPachyderm({
		verifyToken,
		stripeLiaison,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
		premiumStripePlanId,
	}: {
		verifyToken: VerifyToken
		premiumStripePlanId: string
		stripeLiaison: StripeLiaison
		claimsCardinal: ClaimsCardinalTopic<User>
		premiumGiftTable: DbbyTable<PremiumGiftRow>
		stripeBillingTable: DbbyTable<StripeBillingRow>
		stripePremiumTable: DbbyTable<StripePremiumRow>
	}): PaywallPachydermTopic {

	async function verify(accessToken: AccessToken) {
		const {user, scope} = await verifyToken<AccessPayload>(accessToken)
		if (!scope.master) throw new Error("scope forbidden")
		return user
	}

	async function assertBillingRow(userId: string) {
		return stripeBillingTable.assert({
			conditions: {equal: {userId}},
			make: async() => {
				const {stripeCustomerId} = await stripeLiaison.createCustomer()
				return {
					userId,
					customerId: stripeCustomerId,
				}
			}
		})
	}

	async function getStripePremiumRow(userId: string) {
		return stripePremiumTable.one({
			conditions: {equal: {userId}}
		})
	}

	async function getPremiumGiftRow(userId: string) {
		return premiumGiftTable.one({
			conditions: {equal: {userId}}
		})
	}

	return {
		async checkoutPremium({accessToken, popupUrl}) {
			const {userId} = await verify(accessToken)
			const {
				premiumGiftRow,
				stripeBillingRow,
				stripePremiumRow,
			} = await concurrent({
				stripeBillingRow: assertBillingRow(userId),
				stripePremiumRow: getStripePremiumRow(userId),
				premiumGiftRow: getPremiumGiftRow(userId),
			})

			const {customerId: stripeCustomerId} = stripeBillingRow
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
				stripeBillingRow: assertBillingRow(userId),
				stripePremiumRow: getStripePremiumRow(userId),
			})

			if (!stripePremiumRow) throw new Error("no subscription to update")

			// initiate a stripe checkout to update existing subscription
			const {stripeSessionId} = await stripeLiaison
				.checkoutSubscriptionUpdate({
					userId,
					popupUrl,
					flow: "UpdatePremiumSubscription",
					stripeCustomerId: stripeBillingRow.customerId,
					stripeSubscriptionId: stripePremiumRow.subscriptionId,
				})

			// our systems react to the associated stripe webhook
			return {stripeSessionId}
		},

		async cancelPremium({accessToken}) {
			const {userId} = await verify(accessToken)
			const stripePremiumRow = await getStripePremiumRow(userId)
			if (!stripePremiumRow) throw new Error("no subscription to cancel")

			// schedule stripe to cancel the subscription at end of period
			await stripeLiaison.scheduleSubscriptionCancellation({
				stripeSubscriptionId: stripePremiumRow.subscriptionId
			})

			// our systems react to the associated stripe webhook
			return undefined
		},
	}
}
