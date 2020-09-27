
import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {PremiumDatalayer, StripeLiaison} from "./types.js"
import {StripeBillingRow, StripePremiumRow, PremiumGiftRow} from "../../types.js"

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
				conditions: and({equal: {userId}}),
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
				conditions: and({equal: {stripeCustomerId}})
			})
		},

		async getStripePremiumRow(userId) {
			return stripePremiumTable.one({
				conditions: and({equal: {userId}})
			})
		},

		async deleteStripePremiumRow(userId) {
			await stripePremiumTable.delete({
				conditions: and({equal: {userId}})
			})
		},

		async getPremiumGiftRow(userId) {
			return premiumGiftTable.one({
				conditions: and({equal: {userId}})
			})
		},

		async upsertStripePremiumRow(userId, row) {
			return stripePremiumTable.update({
				conditions: and({equal: {userId}}),
				upsert: row,
			})
		},
	}
}
