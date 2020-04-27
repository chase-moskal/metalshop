
import {Collection} from "../../commonjs/mongodb.js"
import {BillingDatalayer, StripeBilling, StripeDatalayer} from "../../interfaces.js"

export function makeBillingDatalayer({stripeDatalayer, collection}: {
		collection: Collection
		stripeDatalayer: StripeDatalayer
	}): BillingDatalayer {

	const internal = {
		async writeRecord(record: StripeBilling) {
			await collection.updateOne(
				{userId: record.userId},
				{$set: record},
				{upsert: true},
			)
		}
	}

	return {
		async getRecord(userId) {
			let record = await collection.findOne<StripeBilling>({userId})
			if (!record) {
				const {stripeCustomerId} = await stripeDatalayer.createCustomer()
				record = {userId, stripeCustomerId}
				await internal.writeRecord(record)
			}
			return record
		},
		async getRecordByStripeCustomerId(stripeCustomerId) {
			return await collection.findOne<StripeBilling>({stripeCustomerId})
		},
		async saveRecord(record) {
			await internal.writeRecord(record)
		},
	}
}
