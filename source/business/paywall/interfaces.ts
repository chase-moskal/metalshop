
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

export interface BillingDatalayer {
	saveRecord(record: StripeBilling): Promise<void>
	getRecord(userId: string): Promise<StripeBilling>
}

export interface StripeLiaisonTopic extends Topic<StripeLiaisonTopic> {
	createSessionForLinking(options: {
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	createSessionForPremium(options: {
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	unlinkPaymentMethod(options: {
			accessToken: AccessToken
		}): Promise<void>
	setPremiumAutoRenew(options: {
			autoRenew: boolean
			accessToken: string
		}): Promise<void>
}

export interface PaywallGuardianTopic extends Topic<PaywallGuardianTopic> {
	grantPremium(options: {
			userId: string
			expires: number
		}): Promise<void>
}

export interface StripeWebhooks {
	["checkout.session.completed"](event: Stripe.Event): Promise<void>
	["customer.subscription.updated"](event: Stripe.Event): Promise<void>
}
