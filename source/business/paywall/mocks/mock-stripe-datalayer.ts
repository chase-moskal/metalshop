
import {StripeDatalayer} from "../../../interfaces.js"

export function mockStripeDatalayer(): StripeDatalayer {
	const data = {
		customers: <{id: string}[]>[],
		subscriptions: <{id: string; cancel_at_period_end: boolean}[]>[],
	}
	return {
		async createCustomer() {
			const stripeCustomerId = `stripe-customer-id-${Date.now()}`
			data.customers.push({id: stripeCustomerId})
			return {stripeCustomerId}
		},
		async updateSubscription({autoRenew, stripeSubscriptionId}) {
			const subscription = data.subscriptions.find(
				sub => sub.id === stripeSubscriptionId
			)
			if (subscription) {
				subscription.cancel_at_period_end = !autoRenew
			}
		},
		async createLinkingSession() {
			return {stripeSessionId: `stripe-linking-session-${Date.now()}`}
		},
		async createSubscriptionSession() {
			return {stripeSessionId: `stripe-subscription-session-${Date.now()}`}
		},
	}
}
