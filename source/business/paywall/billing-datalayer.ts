
import {Collection} from "../../commonjs/mongodb.js"
import {BillingDatalayer, StripeBilling} from "../../interfaces.js"

export function makeBillingDatalayer({collection}: {
		collection: Collection
	}): BillingDatalayer {
	return {
		async getRecord(userId: string): Promise<StripeBilling> {
			throw new Error("TODO implement")
			return null
		},
		async saveRecord(record: StripeBilling): Promise<void> {
			throw new Error("TODO implement")
			return null
		},
	}
}
