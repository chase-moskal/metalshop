
import {Stripe} from "../../commonjs/stripe.js"
import {StripeBillingRow, StripePremiumRow, PremiumGiftRow} from "../../types.js"

export type UpdateFlow = "UpdatePremiumSubscription"

export interface SetupMetadata extends Stripe.Metadata {
	flow: UpdateFlow
}

export interface CardClues {
	brand: string
	last4: string
	country: string
	expireYear: number
	expireMonth: number
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

export interface PremiumDatalayer {
	deleteStripePremiumRow(userId: string): Promise<void>
	getPremiumGiftRow(userId: string): Promise<PremiumGiftRow>
	getStripePremiumRow(userId: string): Promise<StripePremiumRow>
	assertStripeBillingRow(userId: string): Promise<StripeBillingRow>
	upsertStripePremiumRow(userId: string, row: StripePremiumRow): Promise<void>
	getStripeBillingRowByStripeCustomerId(stripeCustomerId: string): Promise<StripeBillingRow>
}

export interface StripeLiaison {
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

export interface StripeWebhooks {
	[eventType: string]: (event: Stripe.Event) => Promise<void>
	["checkout.session.completed"](event: Stripe.Event): Promise<void>
	["customer.subscription.updated"](event: Stripe.Event): Promise<void>
}
