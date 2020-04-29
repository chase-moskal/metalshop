
import {Stripe} from "../../commonjs/stripe.js"
import {Topic, AccessToken, Settings} from "../../interfaces.js"

export interface BillingRecord {
	userId: string
	stripeCustomerId: string
	premiumStripeSubscriptionId?: string
}

export interface StripeSetupMetadata extends Stripe.Metadata {
	flow: string
}

export interface StripeSetupMetadataUpdateSubscription
		extends StripeSetupMetadata {
	flow: "UpdateSubscription"
	stripeSubscriptionId: string
}

export interface StripeDatalayer {

	/** create a new stripe customer */
	createCustomer(): Promise<{stripeCustomerId: string}>

	/** create a stripe session for the purchase of a subscription */
	checkoutSubscriptionPurchase(options: {
			userId: string
			popupUrl: string
			stripePlanId: string
			stripeCustomerId: string
		}): Promise<{stripeSessionId: string}>

	/** create a stripe session to update a particular subscription */
	checkoutSubscriptionUpdate(options: {
			userId: string
			popupUrl: string
			stripeCustomerId: string
			stripeSubscriptionId: string
		}): Promise<{stripeSessionId: string}>

	/** get a payment method object */
	fetchPaymentMethodByIntentId(stripeIntentId: string):
		Promise<Stripe.PaymentMethod>

	fetchPaymentMethodBySubscriptionId(stripeSubscriptionId: string):
		Promise<Stripe.PaymentMethod>

	/** get details about a subscription */
	fetchSubscriptionDetails(stripeSubscriptionId: string): Promise<{
			expires: number
			status: Stripe.Subscription.Status
		}>

	/** update a stripe subscription's payment method */
	updateSubscriptionPaymentMethod(options: {
			stripeSubscriptionId: string
			stripePaymentMethodId: string
		}): Promise<void>

	/** cancel a stripe subscription */
	scheduleSubscriptionCancellation(options: {
			stripeSubscriptionId: string
		}): Promise<void>
}

export interface SettingsDatalayer {
	saveSettings(settings: Settings): Promise<void>
	getOrCreateSettings(userId: string): Promise<Settings>
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