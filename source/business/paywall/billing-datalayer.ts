
import {Collection} from "../../commonjs/mongodb.js"
import {BillingDatalayer, BillingRecord, StripeDatalayer} from "../../interfaces.js"

export function makeBillingDatalayer({stripeDatalayer, collection}: {
		collection: Collection
		stripeDatalayer: StripeDatalayer
	}): BillingDatalayer {

	const internal = {
		async writeRecord(record: BillingRecord) {
			await collection.updateOne(
				{userId: record.userId},
				{$set: record},
				{upsert: true},
			)
		}
	}

	return {
		async getOrCreateRecord(userId) {
			let record = await collection.findOne<BillingRecord>({userId})
			if (!record) {
				const {stripeCustomerId} = await stripeDatalayer.createCustomer()
				record = {userId, stripeCustomerId}
				await internal.writeRecord(record)
			}
			return record
		},
		async getRecordByStripeCustomerId(stripeCustomerId) {
			return await collection.findOne<BillingRecord>({stripeCustomerId})
		},
		async setRecord(record) {
			await internal.writeRecord(record)
		},
	}
}