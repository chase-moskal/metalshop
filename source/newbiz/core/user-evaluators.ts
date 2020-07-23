
import {MetalUser} from "../../types.js"

export function isStaff(user: MetalUser): boolean {
	return !!user.claims.admin || !!user.claims.staff
}

export function isPremium(user: MetalUser): boolean {
	const {premiumUntil} = user.claims
	return (isStaff(user) || !!(premiumUntil && active(premiumUntil)))
}

export function isBanned(user: MetalUser): boolean {
	const {banUntil} = user.claims
	return !!(banUntil && active(banUntil))
}

/////////

function active(until: number): boolean {
	return (until - Date.now()) < 0
}
