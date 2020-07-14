
import {Stripe} from "../../../commonjs/stripe.js"
import {toPaymentDetails, toSubscriptionDetails} from "../helpers.js"
import {random8, randomSequence, numbers} from "../../../toolbox/random8.js"
import {StripeDatalayer, StripeWebhooks, UpdateFlow} from "../../../interfaces.js"

interface MockCustomer extends Partial<Stripe.Customer> {
	id: string
}

interface MockSubscription extends Partial<Stripe.Subscription> {
	id: string
	plan: {id: string} & any
	current_period_end: number
	cancel_at_period_end: boolean
	default_payment_method: string
	status: Stripe.Subscription.Status
}

interface MockPaymentMethod extends Partial<Stripe.PaymentMethod> {
	id: string
	card: Stripe.PaymentMethod.Card
}

interface MockSetupIntent extends Partial<Stripe.SetupIntent> {
	id: string
	customer: string
	payment_method: string
	metadata: {
		subscription_id: string
	}
}

export function mockStripeDatalayer({webhooks}: {
		webhooks: StripeWebhooks
	}): StripeDatalayer {

	const data = {
		customers: <MockCustomer[]>[],
		setupIntents: <MockSetupIntent[]>[],
		subscriptions: <MockSubscription[]>[],
		paymentMethods: <MockPaymentMethod[]>[],
	}

	const idTag = (tag: string) => `${tag}-${random8()}`
	const webhookId = () => `mock-stripe-webhook-event-${random8()}`
	const days = (n: number) => n * (1000 * 60 * 60 * 24)

	function insertCustomer(customer: MockCustomer) {
		data.customers.push(customer)
	}

	function insertSetupIntent(setupIntent: MockSetupIntent) {
		data.setupIntents.push(setupIntent)
	}

	function insertSubscription(subscription: MockSubscription) {
		data.subscriptions.push(subscription)
	}

	function insertPaymentMethod(paymentMethod: MockPaymentMethod) {
		data.paymentMethods.push(paymentMethod)
	}

	function fetchCustomer(id: string) {
		return data.customers.find(c => c.id === id)
	}

	function fetchSubscription(id: string) {
		return data.subscriptions.find(c => c.id === id)
	}

	function fetchPaymentMethod(id: string) {
		return data.paymentMethods.find(c => c.id === id)
	}

	function fetchSetupIntent(id: string) {
		return data.setupIntents.find(c => c.id === id)
	}

	function mockSessionForSubscriptionPurchase({
			userId,
			customer,
			subscription,
		}: {
			userId: string
			customer: MockCustomer
			subscription: MockSubscription
		}): Partial<Stripe.Checkout.Session> {
		return {
			id: idTag("mock-stripe-session"),
			mode: "subscription",
			customer: customer.id,
			client_reference_id: userId,
			subscription: subscription.id,
		}
	}

	function mockSessionForSubscriptionUpdate({
			flow,
			userId,
			customer,
			setupIntent,
		}: {
			userId: string
			flow: UpdateFlow
			customer: MockCustomer
			setupIntent: MockSetupIntent
		}): Partial<Stripe.Checkout.Session> {
		return {
			id: idTag("mock-stripe-session"),
			mode: "setup",
			metadata: {flow},
			customer: customer.id,
			client_reference_id: userId,
			setup_intent: setupIntent.id,
		}
	}

	function mockCustomer(): MockCustomer {
		const customer = {
			id: idTag("mock-stripe-customer")
		}
		insertCustomer(customer)
		return customer
	}

	function mockPaymentMethod(): MockPaymentMethod {
		const paymentMethod = {
			id: idTag("mock-stripe-payment-method"),
			card: {
				brand: "FAKEVISA",
				country: "US",
				exp_year: 2020,
				exp_month: 10,
				last4: randomSequence(4, numbers),
				description: "description",
				funding: "credit",
				checks: null,
				wallet: null,
				networks: null,
				three_d_secure_usage: null,
			},
		}
		insertPaymentMethod(paymentMethod)
		return paymentMethod
	}

	function mockSetupIntent({customer, subscription, paymentMethod}: {
			customer: MockCustomer
			subscription: MockSubscription
			paymentMethod: MockPaymentMethod
		}): MockSetupIntent {
		const setupIntent: MockSetupIntent = {
			id: idTag("mock-stripe-setup-intent"),
			customer: customer.id,
			payment_method: paymentMethod.id,
			metadata: {
				subscription_id: subscription.id
			},
		}
		insertSetupIntent(setupIntent)
		return setupIntent
	}

	function mockSubscription({planId, customer, paymentMethod}: {
			planId: string
			customer: MockCustomer
			paymentMethod: MockPaymentMethod
		}): MockSubscription {
		const subscription: MockSubscription = {
			id: idTag("mock-stripe-subscription"),
			status: "active",
			plan: {id: planId},
			customer: customer.id,
			cancel_at_period_end: false,
			current_period_end: Date.now() + days(30),
			default_payment_method: paymentMethod.id,
		}
		insertSubscription(subscription)
		return subscription
	}

	return {

		async createCustomer() {
			const customer = mockCustomer()
			return {stripeCustomerId: customer.id}
		},

		async checkoutSubscriptionPurchase({
				userId,
				popupUrl,
				stripePlanId,
				stripeCustomerId,
			}) {
			const customer = fetchCustomer(stripeCustomerId)
			const paymentMethod = mockPaymentMethod()
			const subscription = mockSubscription({
				customer,
				paymentMethod,
				planId: stripePlanId,
			})
			const session = mockSessionForSubscriptionPurchase({
				userId,
				customer,
				subscription,
			})

			await webhooks["checkout.session.completed"](<any>{
				id: webhookId(),
				data: {object: session},
			})

			return {stripeSessionId: session.id}
		},

		async checkoutSubscriptionUpdate({
				flow,
				userId,
				stripeCustomerId,
				stripeSubscriptionId,
			}) {

			const customer = fetchCustomer(stripeCustomerId)
			const subscription = fetchSubscription(stripeSubscriptionId)

			const paymentMethod = mockPaymentMethod()
			const setupIntent = mockSetupIntent({
				customer,
				subscription,
				paymentMethod,
			})
			const session = mockSessionForSubscriptionUpdate({
				flow,
				userId,
				customer,
				setupIntent,
			})

			await webhooks["checkout.session.completed"](<any>{
				id: webhookId(),
				data: {object: session},
			})

			return {stripeSessionId: session.id}
		},

		async updateSubscriptionPaymentMethod({
				stripeSubscriptionId,
				stripePaymentMethodId,
			}) {
			const subscription = fetchSubscription(stripeSubscriptionId)
			subscription.default_payment_method = stripePaymentMethodId
			await webhooks["customer.subscription.updated"](<any>{
				id: webhookId(),
				data: {object: subscription}
			})
		},

		async scheduleSubscriptionCancellation({
				stripeSubscriptionId,
			}) {
			const subscription = fetchSubscription(stripeSubscriptionId)
			subscription.cancel_at_period_end = true
			subscription.status = "canceled"
			await webhooks["customer.subscription.updated"](<any>{
				id: webhookId(),
				data: {object: subscription}
			})
		},

		async fetchSubscriptionDetails(subscriptionId) {
			const subscription = fetchSubscription(subscriptionId)
			return toSubscriptionDetails(subscription)
		},

		async fetchPaymentDetails(paymentMethodId) {
			const paymentMethod = fetchPaymentMethod(paymentMethodId)
			return toPaymentDetails(paymentMethod)
		},

		async fetchPaymentDetailsByIntentId(setupIntentId) {
			const setupIntent = fetchSetupIntent(setupIntentId)
			const paymentMethod = fetchPaymentMethod(setupIntent.payment_method)
			return toPaymentDetails(paymentMethod)
		},

		async fetchPaymentDetailsBySubscriptionId(subscriptionId) {
			const subscription = fetchSubscription(subscriptionId)
			const paymentMethod = fetchPaymentMethod(subscription.default_payment_method)
			return toPaymentDetails(paymentMethod)
		},
	}
}
