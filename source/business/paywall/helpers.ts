
import {Stripe} from "../../commonjs/stripe.js"
import {PaymentDetails, SubscriptionDetails, MinimalCard} from "./types.js"

export const getStripeId = (x: string | {id: string}) => {
	return x && (
		typeof x === "string"
			? x
			: x.id
	)
}

export const toPaymentDetails = ({id, card}: {
		id: string
		card?: MinimalCard
	}): PaymentDetails => ({

	stripePaymentMethodId: id,
	card: card && {
		brand: card.brand,
		last4: card.last4,
		country: card.country,
		expireYear: card.exp_year,
		expireMonth: card.exp_month,
	},
})

export const toSubscriptionDetails = (
		subscription: Partial<Stripe.Subscription>
	): SubscriptionDetails => ({

	status: subscription.status,
	current_period_end: subscription.current_period_end,
})
