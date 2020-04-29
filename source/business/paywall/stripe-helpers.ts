
import {CardClues} from "../../interfaces.js"
import {Stripe} from "../../commonjs/stripe.js"

export const stripeGetId = (x: string | {id: string}) => {
	return x && (
		typeof x === "string"
			? x
			: x.id
	)
}

export const getCardClues = ({card}: Stripe.PaymentMethod): CardClues => (
	card && {
		brand: card.brand,
		last4: card.last4,
		country: card.country,
		expireYear: card.exp_year,
		expireMonth: card.exp_month,
	}
)

export const getSubscriptionDetails = (subscription: Stripe.Subscription) => ({
	status: subscription.status,
	expires: subscription.current_period_end,
})
