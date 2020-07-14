
import {StripeDatalayer, BillingTable, BillingRecord, BillingDatalayer} from "../../interfaces.js"

export function makeBillingDatalayer({billingTable, stripeDatalayer}: {
		billingTable: BillingTable
		stripeDatalayer: StripeDatalayer
	}): BillingDatalayer {

	async function writeRecord(record: BillingRecord) {
		await billingTable.update({
			conditions: {equal: {userId: record.userId}},
			upsert: record,
		})
	}

	async function getOrCreateRecord(userId: string) {
		let record = await billingTable.one({conditions: {equal: {userId}}})
		if (!record) {
			const {stripeCustomerId} = await stripeDatalayer.createCustomer()
			record = {userId, stripeCustomerId}
			await writeRecord(record)
		}
		return record
	}

	async function getRecordByStripeCustomerId(stripeCustomerId: string) {
		return billingTable.one({conditions: {equal: {stripeCustomerId}}})
	}

	return {writeRecord, getOrCreateRecord, getRecordByStripeCustomerId}
}
