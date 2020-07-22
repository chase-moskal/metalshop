
import {MetalUser} from "../../types.js"

export function isPremium(user: MetalUser) {
	const {premiumUntil} = user?.claims
	return (premiumUntil && (premiumUntil - Date.now()) > 0)
		? true
		: false
}
