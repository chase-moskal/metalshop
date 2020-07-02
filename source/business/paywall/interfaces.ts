
import {Stripe} from "../../commonjs/stripe.js"
import {Topic, AccessToken, CardClues, BillingRecord} from "../../interfaces.js"

export type UpdateFlow = "UpdatePremiumSubscription"

export interface SetupMetadata extends Stripe.Metadata {
	flow: UpdateFlow
}

export interface PaymentDetails {
	card: CardClues
	stripePaymentMethodId: string
}

export interface SubscriptionDetails {
	status: Stripe.Subscription.Status
	expires: number
}

export interface MinimalCard extends Partial<Stripe.PaymentMethod.Card> {
	brand: string,
	last4: string,
	country: string,
	exp_year: number,
	exp_month: number,
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
	updateSubscriptionPaymentMethod(options: {
			stripeSubscriptionId: string
			stripePaymentMethodId: string
		}): Promise<void>
	scheduleSubscriptionCancellation(options: {
			stripeSubscriptionId: string
		}): Promise<void>
	fetchSubscriptionDetails(stripeSubscriptionId: string): Promise<{
			expires: number
			status: Stripe.Subscription.Status
		}>
	fetchPaymentDetails(stripePaymentMethodId: string):
		Promise<PaymentDetails>
	fetchPaymentDetailsByIntentId(stripeIntentId: string):
		Promise<PaymentDetails>
	fetchPaymentDetailsBySubscriptionId(stripeSubscriptionId: string):
		Promise<PaymentDetails>
}

export interface BillingDatalayer {
	writeRecord(record: BillingRecord): Promise<void>
	getOrCreateRecord(userId: string): Promise<BillingRecord>
	getRecordByStripeCustomerId(stripeCustomerId: string): Promise<BillingRecord>
}

export interface PaywallLiaisonTopic extends Topic<PaywallLiaisonTopic> {
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
