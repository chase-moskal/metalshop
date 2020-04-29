
import {stripeGetId} from "./stripe-helpers.js"
import {Stripe} from "../../commonjs/stripe.js"
import {StripeDatalayer, StripeSetupMetadataUpdateSubscription} from "../../interfaces.js"

export function makeStripeDatalayer({stripe}: {
		stripe: Stripe
	}): StripeDatalayer {

	const internal = {
		commonSessionParams: ({userId, popupUrl, stripeCustomerId}: {
				userId: string
				popupUrl: string
				stripeCustomerId: string
			}): Stripe.Checkout.SessionCreateParams => ({
			customer: stripeCustomerId,
			client_reference_id: userId,
			payment_method_types: ["card"],
			cancel_url: `${popupUrl}#cancel`,
			success_url: `${popupUrl}#success`,
		}),
	}

	return {
		async createCustomer() {
			const {id: stripeCustomerId} = await stripe.customers.create()
			return {stripeCustomerId}
		},
		async checkoutSubscriptionPurchase({
				userId,
				popupUrl,
				stripePlanId,
				stripeCustomerId,
			}) {
			const {id: stripeSessionId} = await stripe.checkout.sessions.create({
				...internal.commonSessionParams({userId, popupUrl, stripeCustomerId}),
				mode: "subscription",
				subscription_data: {items: [{
					quantity: 1,
					plan: stripePlanId,
				}]},
			})
			return {stripeSessionId}
		},
		async checkoutSubscriptionUpdate({
				userId,
				popupUrl,
				stripeCustomerId,
				stripeSubscriptionId,
			}) {
			const {id: stripeSessionId} = await stripe.checkout.sessions.create({
				...internal.commonSessionParams({userId, popupUrl, stripeCustomerId}),
				mode: "setup",
				metadata: <StripeSetupMetadataUpdateSubscription>{
					flow: "UpdateSubscription",
					stripeSubscriptionId,
				},
			})
			return {stripeSessionId}
		},
		async fetchSubscriptionDetails(subscriptionId) {
			const subscription = await stripe.subscriptions.retrieve(subscriptionId)
			return {
				status: subscription.status,
				expires: subscription?.current_period_end,
			}
		},
		async fetchPaymentMethodByIntentId(intentId) {
			const intent = await stripe.setupIntents.retrieve(intentId)
			const stripePaymentMethod = await stripe.paymentMethods.retrieve(
				stripeGetId(intent.payment_method)
			)
			return stripePaymentMethod
		},
		async fetchPaymentMethodBySubscriptionId(stripeSubscriptionId) {
			const subscription = await stripe.subscriptions
				.retrieve(stripeSubscriptionId)
			const paymentMethodId =
				stripeGetId(subscription.default_payment_method)
			const stripePaymentMethod = await stripe.paymentMethods
				.retrieve(paymentMethodId)
			return stripePaymentMethod
		},
		async updateSubscriptionPaymentMethod({
				stripeSubscriptionId,
				stripePaymentMethodId,
			}) {
			await stripe.subscriptions.update(stripeSubscriptionId, {
				default_payment_method: stripePaymentMethodId
			})
		},
		async scheduleSubscriptionCancellation({
				stripeSubscriptionId,
			}) {
			await stripe.subscriptions.update(stripeSubscriptionId, {
				cancel_at_period_end: true
			})
		},
		// async updateSubscriptionAutoRenew({autoRenew, stripeSubscriptionId}) {
		// 	await stripe.subscriptions.update(stripeSubscriptionId, {
		// 		cancel_at_period_end: !autoRenew
		// 	})
		// },
		// async updateSubscriptionPaymentMethod({
		// 		stripeSubscriptionId,
		// 		stripePaymentMethodId,
		// 	}) {
		// 	await stripe.subscriptions.update(stripeSubscriptionId, {
		// 		default_payment_method: stripePaymentMethodId
		// 	})
		// },
		// async createLinkingSession({userId, popupUrl, stripeCustomerId}) {
		// 	const {id: stripeSessionId} = await stripe.checkout.sessions.create({
		// 		...internal.commonSessionParams({userId, popupUrl, stripeCustomerId}),
		// 		mode: "setup",
		// 	})
		// 	return {stripeSessionId}
		// },
		// async createSubscriptionSession({
		// 		userId,
		// 		popupUrl,
		// 		stripeCustomerId,
		// 		premiumSubscriptionStripePlanId,
		// 	}) {
		// 	const {id: stripeSessionId} = await stripe.checkout.sessions.create({
		// 		...internal.commonSessionParams({userId, popupUrl, stripeCustomerId}),
		// 		mode: "subscription",
		// 		payment_intent_data: {setup_future_usage: "off_session"},
		// 		subscription_data: {items: [{
		// 			quantity: 1,
		// 			plan: premiumSubscriptionStripePlanId,
		// 		}]},
		// 	})
		// 	return {stripeSessionId}
		// },
	}
}
