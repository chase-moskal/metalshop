
import {PaywallOverlordTopic} from "../../interfaces.js"
import {AuthVanguardTopic} from "../auth-api/interfaces.js"

export function makePaywallOverlord({authVanguard}: {
	authVanguard: AuthVanguardTopic
}): PaywallOverlordTopic {
	return {

		async setUserPremiumClaim({userId, expires}): Promise<void> {
			const {claims} = await authVanguard.getUser({userId})
			claims.premium = claims.premium
				? {...claims.premium, expires}
				: {expires}
			await authVanguard.setClaims({userId, claims})
		},

		async setUserBillingClaim({userId, linked}): Promise<void> {
			const {claims} = await authVanguard.getUser({userId})
			claims.billing = claims.billing
				? {...claims.billing, linked}
				: {linked}
			await authVanguard.setClaims({userId, claims})
		},
	}
}
