
import {Stripe} from "../../../commonjs/stripe.js"
import {DbbyTable} from "../../../toolbox/dbby/types.js"

export interface MockCustomer extends Partial<Stripe.Customer> {
	id: string
}

export interface MockSubscription extends Partial<Stripe.Subscription> {
	id: string
	plan: {id: string} & any
	current_period_end: number
	cancel_at_period_end: boolean
	default_payment_method: string
	status: Stripe.Subscription.Status
}

export interface MockPaymentMethod extends Partial<Stripe.PaymentMethod> {
	id: string
	card: Stripe.PaymentMethod.Card
}

export interface MockSetupIntent extends Partial<Stripe.SetupIntent> {
	id: string
	customer: string
	payment_method: string
	metadata: {
		subscription_id: string
	}
}

export interface MockStripeTables {
	customers: DbbyTable<MockCustomer>
	setupIntents: DbbyTable<MockSetupIntent>
	subscriptions: DbbyTable<MockSubscription>
	paymentMethods: DbbyTable<MockPaymentMethod>
}
