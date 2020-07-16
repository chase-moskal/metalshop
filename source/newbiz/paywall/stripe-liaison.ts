
import {Stripe} from "../../commonjs/stripe.js"
import {StripeDatalayer, SetupMetadata} from "../../interfaces.js"
import {getStripeId, toPaymentDetails, toSubscriptionDetails} from "./helpers.js"

export function makeStripeLiaison({stripe}: {
		stripe: Stripe
	}): StripeDatalayer {

	const commonSessionParams = ({userId, popupUrl, stripeCustomerId}: {
			userId: string
			popupUrl: string
			stripeCustomerId: string
		}): Stripe.Checkout.SessionCreateParams => ({
		customer: stripeCustomerId,
		client_reference_id: userId,
		payment_method_types: ["card"],
		cancel_url: `${popupUrl}#cancel`,
		success_url: `${popupUrl}#success`,
	})

	return {

		async createCustomer() {
			const customer = await stripe.customers.create()
			return {stripeCustomerId: customer.id}
		},

		async checkoutSubscriptionPurchase({
				userId,
				popupUrl,
				stripePlanId,
				stripeCustomerId,
			}) {
			const session = await stripe.checkout.sessions.create({
				...commonSessionParams({userId, popupUrl, stripeCustomerId}),
				mode: "subscription",
				subscription_data: {items: [{
					quantity: 1,
					plan: stripePlanId,
				}]},
			})
			return {stripeSessionId: session.id}
		},

		async checkoutSubscriptionUpdate({
				flow,
				userId,
				popupUrl,
				stripeCustomerId,
				stripeSubscriptionId,
			}) {
			const session = await stripe.checkout.sessions.create({
				...commonSessionParams({userId, popupUrl, stripeCustomerId}),
				mode: "setup",
				setup_intent_data: {
					metadata: {
						customer_id: stripeCustomerId,
						subscription_id: stripeSubscriptionId,
					}
				},
				metadata: <SetupMetadata>{flow},
			})
			return {stripeSessionId: session.id}
		},

		async updateSubscriptionPaymentMethod({
				stripeSubscriptionId,
				stripePaymentMethodId,
			}) {
			await stripe.subscriptions.update(stripeSubscriptionId, {
				default_payment_method: stripePaymentMethodId
			})
		},

		async scheduleSubscriptionCancellation({stripeSubscriptionId}) {
			await stripe.subscriptions.update(stripeSubscriptionId, {
				cancel_at_period_end: true
			})
		},

		async fetchSubscriptionDetails(subscriptionId) {
			const subscription = await stripe.subscriptions.retrieve(subscriptionId)
			return toSubscriptionDetails(subscription)
		},

		async fetchPaymentDetails(stripePaymentMethodId) {
			return toPaymentDetails(
				await stripe.paymentMethods.retrieve(stripePaymentMethodId)
			)
		},

		async fetchPaymentDetailsByIntentId(intentId) {
			const intent = await stripe.setupIntents.retrieve(intentId)
			return toPaymentDetails(
				await stripe.paymentMethods.retrieve(
					getStripeId(intent.payment_method)
				)
			)
		},

		async fetchPaymentDetailsBySubscriptionId(stripeSubscriptionId) {
			const subscription = await stripe.subscriptions
				.retrieve(stripeSubscriptionId)
			const paymentMethodId = getStripeId(subscription.default_payment_method)
			return toPaymentDetails(
				await stripe.paymentMethods.retrieve(paymentMethodId)
			)
		},
	}
}
