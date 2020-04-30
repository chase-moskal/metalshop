
import {Stripe} from "../../commonjs/stripe.js"
import {Topic, AccessToken, Settings} from "../../interfaces.js"

export interface BillingRecord {
	userId: string
	stripeCustomerId: string
	premiumStripeSubscriptionId?: string
}

export type UpdateFlow = "UpdatePremiumSubscription"

export interface StripeSetupMetadata extends Stripe.Metadata {
	flow: UpdateFlow
}

export interface StripeDatalayer {
	createCustomer(): Promise<{stripeCustomerId: string}>
	checkoutSubscriptionPurchase(options: {
			userId: string
			popupUrl: string
			stripePlanId: string
			stripeCustomerId: string
		}): Promise<{stripeSessionId: string}>
	checkoutSubscriptionUpdate(options: {
			userId: string
			flow: UpdateFlow
			popupUrl: string
			stripeCustomerId: string
			stripeSubscriptionId: string
		}): Promise<{stripeSessionId: string}>
	fetchPaymentMethod(stripePaymentMethodId: string):
		Promise<Stripe.PaymentMethod>
	fetchPaymentMethodByIntentId(stripeIntentId: string):
		Promise<Stripe.PaymentMethod>
	fetchPaymentMethodBySubscriptionId(stripeSubscriptionId: string):
		Promise<Stripe.PaymentMethod>
	fetchSubscriptionDetails(stripeSubscriptionId: string): Promise<{
			expires: number
			status: Stripe.Subscription.Status
		}>
	updateSubscriptionPaymentMethod(options: {
			stripeSubscriptionId: string
			stripePaymentMethodId: string
		}): Promise<void>
	scheduleSubscriptionCancellation(options: {
			stripeSubscriptionId: string
		}): Promise<void>
}

export interface BillingDatalayer {
	setRecord(record: BillingRecord): Promise<void>
	getOrCreateRecord(userId: string): Promise<BillingRecord>
	getRecordByStripeCustomerId(stripeCustomerId: string): Promise<BillingRecord>
}

export interface StripeLiaisonTopic extends Topic<StripeLiaisonTopic> {
	checkoutPremium(options: {
			popupUrl: string
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	updatePremium(options: {
			popupUrl: string
			accessToken: string
		}): Promise<{stripeSessionId: string}>
	cancelPremium(options: {
			accessToken: AccessToken
		}): Promise<void>
}

export interface StripeWebhooks {
	[eventType: string]: (event: Stripe.Event) => Promise<void>
	["checkout.session.completed"](event: Stripe.Event): Promise<void>
	["customer.subscription.updated"](event: Stripe.Event): Promise<void>
}
