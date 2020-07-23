
import {MetalUser} from "../../types.js"

export function isStaff(user: MetalUser): boolean {
	return user && (!!user.claims.admin || !!user.claims.staff)
}

export function isPremium(user: MetalUser): boolean {
	return user && (isStaff(user) || active(user.claims.premiumUntil))
}

export function isBanned(user: MetalUser): boolean {
	return user && active(user.claims.banUntil)
}

/////////

function active(until: number): boolean {
	return !!(until && (until - Date.now()) < 0)
}
