
import {Stripe} from "../../../commonjs/stripe.js"
import {random8} from "../../../toolbox/random8.js"
import {StripeDatalayer, StripeWebhooks} from "../../../interfaces.js"

interface MockCustomer {
	id: string
}

interface MockSubscription {
	id: string
	cancel_at_period_end: boolean
}

interface MockPaymentMethod {
	id: string
	card: Stripe.PaymentMethod.Card
}

export function mockStripeDatalayer({webhooks}: {
		webhooks: StripeWebhooks
	}): StripeDatalayer {

	const data = {
		customers: <MockCustomer[]>[],
		subscriptions: <MockSubscription[]>[],
		paymentMethods: <MockPaymentMethod[]>[],
	}

	const mockSessionId = () => `mock-session-${random8()}`

	function insertCustomer(customer: MockCustomer) {
		data.customers.push(customer)
	}

	return {

		async createCustomer() {
			const stripeCustomerId = `stripe-customer-id-${Date.now()}`
			insertCustomer({id: stripeCustomerId})
			return {stripeCustomerId}
		},

		async checkoutSubscriptionPurchase({
				userId,
				popupUrl,
				stripePlanId,
				stripeCustomerId,
			}) {
			const stripeSessionId = mockSessionId()
			await webhooks["checkout.session.completed"](<any>{
				id: stripeSessionId,
				data: {object: <Partial<Stripe.Checkout.Session>>{
					mode: "subscription",
					client_reference_id: userId,
					subscription: "fake-subscription-id",
				}},
			})
			return null
		},

		async checkoutSubscriptionUpdate({
				flow,
				userId,
				stripeCustomerId,
				stripeSubscriptionId,
			}) {
			const stripeSessionId = mockSessionId()
			await webhooks["checkout.session.completed"](<any>{data: {
				object: <Partial<Stripe.Checkout.Session>>{
					mode: "setup",
					metadata: {flow},
					customer: stripeCustomerId,
					client_reference_id: userId,
					subscription: stripeSubscriptionId,
				}
			}})
			return {stripeSessionId}
		},

		async fetchPaymentMethod(id: string) {
			return null
		},

		async fetchPaymentMethodByIntentId(id: string) {
			return null
		},

		async fetchPaymentMethodBySubscriptionId(id: string) {
			return null
		},

		async fetchSubscriptionDetails(id: string) {
			return null
		},

		async updateSubscriptionPaymentMethod({
				stripeSubscriptionId,
				stripePaymentMethodId,
			}) {
			// TODO mockup webhook call
			// await onUpdateSubscriptionPaymentMethod()
			return null
		},

		async scheduleSubscriptionCancellation({
				stripeSubscriptionId,
			}) {
			// TODO mockup webhook call
			// await onScheduleSubscriptionCancellation()
			return null
		},

		// async updateSubscriptionAutoRenew({autoRenew, stripeSubscriptionId}) {
		// 	const subscription = data.subscriptions.find(
		// 		sub => sub.id === stripeSubscriptionId
		// 	)
		// 	if (subscription) {
		// 		subscription.cancel_at_period_end = !autoRenew
		// 	}
		// },
		// async updateSubscriptionPaymentMethod({
		// 		stripeSubscriptionId,
		// 		stripePaymentMethodId,
		// 	}) {
		// 	return undefined
		// },
		// async createLinkingSession() {
		// 	return {stripeSessionId: `stripe-linking-session-${Date.now()}`}
		// },
		// async createSubscriptionSession() {
		// 	return {stripeSessionId: `stripe-subscription-session-${Date.now()}`}
		// },
	}
}
