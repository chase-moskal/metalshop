
import {Stripe} from "../../../commonjs/stripe.js"
import {DbbyTable, DbbyRow} from "../../../toolbox/dbby/dbby-types.js"

export type MockCustomer = DbbyRow & Partial<Stripe.Customer> & {
	id: string
}

export type MockSubscription = DbbyRow & Partial<Stripe.Subscription> & {
	id: string
	plan: {id: string} & any
	current_period_end: number
	cancel_at_period_end: boolean
	default_payment_method: string
	status: Stripe.Subscription.Status
}

export type MockPaymentMethod = DbbyRow & Partial<Stripe.PaymentMethod> & {
	id: string
	card: Stripe.PaymentMethod.Card
}

export type MockSetupIntent = DbbyRow & Partial<Stripe.SetupIntent> & {
	id: string
	customer: string
	payment_method: string
	metadata: {
		subscription_id: string
	}
}

export interface MockStripeTables {
	customers: DbbyTable<DbbyRow & MockCustomer>
	setupIntents: DbbyTable<DbbyRow & MockSetupIntent>
	subscriptions: DbbyTable<DbbyRow & MockSubscription>
	paymentMethods: DbbyTable<DbbyRow & MockPaymentMethod>
}
