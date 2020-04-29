
import {CardClues} from "../../interfaces.js"
import {Stripe} from "../../commonjs/stripe.js"

export const stripeGetId = (x: string | {id: string}) => {
	return x && (
		typeof x === "string"
			? x
			: x.id
	)
}
