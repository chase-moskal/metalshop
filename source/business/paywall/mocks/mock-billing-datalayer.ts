
import {BillingDatalayer, BillingRecord, StripeDatalayer} from "../../../interfaces.js"

export function mockBillingDatalayer({stripe}: {
		stripe: StripeDatalayer
	}): BillingDatalayer {

	const data = {
		records: <BillingRecord[]>[],
	}

	return {
		async getOrCreateRecord(userId) {
			let record = data.records.find(record => record.userId === userId)
			if (!record) {
				const {stripeCustomerId} = await stripe.createCustomer()
				record = {userId, stripeCustomerId}
				data.records.push(record)
			}
			return record
		},
		async getRecordByStripeCustomerId(stripeCustomerId) {
			return data.records.find(
				record => record.stripeCustomerId === stripeCustomerId
			)
		},
		async setRecord(record) {
			let assigned = false
			for (let i = 0; i < data.records.length; i++) {
				if (data.records[i] === record) {
					data.records[i] = record
					assigned = true
				}
			}
			if (!assigned) data.records.push(record)
		},
	}
}
