
import {Stripe} from "../../commonjs/stripe.js"
import {Topic, AccessToken} from "../../interfaces.js"

export interface StripeBilling {
	userId: string
	stripeCustomerId: string
	stripePaymentMethodId?: string
	premiumSubscription?: {
		autoRenew: boolean
		stripeSubscriptionId: string
	}
}

export interface StripeDatalayer {
	createCustomer(): Promise<{stripeCustomerId: string}>
	createLinkingSession(options: {
			userId: string
			popupUrl: string
			stripeCustomerId: string
		}): Promise<{stripeSessionId: string}>
	createSubscriptionSession(options: {
			userId: string
			popupUrl: string
			stripeCustomerId: string
			premiumSubscriptionStripePlanId: string
		}): Promise<{stripeSessionId: string}>
	updateSubscriptionAutoRenew(options: {
			autoRenew: boolean
			stripeSubscriptionId: string
		}): Promise<void>
	updateSubscriptionPaymentMethod(options: {
			stripeSubscriptionId: string
			stripePaymentMethodId: string
		}): Promise<void>
}

export interface BillingDatalayer {
	saveRecord(record: StripeBilling): Promise<void>
	getRecord(userId: string): Promise<StripeBilling>
	getRecordByStripeCustomerId(stripeCustomerId: string): Promise<StripeBilling>
}

export interface StripeLiaisonTopic extends Topic<StripeLiaisonTopic> {
	createSessionForLinking(options: {
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	createSessionForPremium(options: {
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	unlink(options: {
			accessToken: AccessToken
		}): Promise<void>
	setPremiumAutoRenew(options: {
			autoRenew: boolean
			accessToken: string
		}): Promise<void>
}

export interface StripeWebhooks {
	[eventType: string]: (event: Stripe.Event) => Promise<void>
	["checkout.session.completed"](event: Stripe.Event): Promise<void>
	["customer.subscription.updated"](event: Stripe.Event): Promise<void>
}
