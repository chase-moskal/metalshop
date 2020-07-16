
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {PremiumDatalayer, StripeLiaison, StripeBillingRow, StripePremiumRow, PremiumGiftRow} from "../../types.js"

export function makePremiumDatalayer({
		stripeLiaison,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
	}: {
		stripeLiaison: StripeLiaison
		premiumGiftTable: DbbyTable<PremiumGiftRow>
		stripeBillingTable: DbbyTable<StripeBillingRow>
		stripePremiumTable: DbbyTable<StripePremiumRow>
	}): PremiumDatalayer {
	return {

		async assertStripeBillingRow(userId) {
			return stripeBillingTable.assert({
				conditions: {equal: {userId}},
				make: async() => {
					const {stripeCustomerId} = await stripeLiaison.createCustomer()
					return {
						userId,
						stripeCustomerId,
					}
				}
			})
		},

		async getStripeBillingRowByStripeCustomerId(stripeCustomerId) {
			return stripeBillingTable.one({
				conditions: {equal: {stripeCustomerId}}
			})
		},

		async getStripePremiumRow(userId) {
			return stripePremiumTable.one({
				conditions: {equal: {userId}}
			})
		},

		async deleteStripePremiumRow(userId) {
			await stripePremiumTable.delete({
				conditions: {equal: {userId}}
			})
		},

		async getPremiumGiftRow(userId) {
			return premiumGiftTable.one({
				conditions: {equal: {userId}}
			})
		},

		async upsertStripePremiumRow(userId, row) {
			return stripePremiumTable.update({
				conditions: {equal: {userId}},
				upsert: row,
			})
		},
	}
}
