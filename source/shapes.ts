
import {Shape} from "renraku/dist/interfaces.js"

import {
	ClaimsVanguardTopic,
	PaywallGuardianTopic,
	AuthExchangerTopic,
	ProfileMagistrateTopic,
} from "./interfaces.js"

export const authExchangerShape: Shape<AuthExchangerTopic> = {
	authorize: true,
	authenticateViaGoogle: true,
}

export const profileMagistrateShape: Shape<ProfileMagistrateTopic> = {
	getFullProfile: true,
	setFullProfile: true,
	getPublicProfile: true,
}

export const claimsVanguardShape: Shape<ClaimsVanguardTopic> = {
	getUser: true,
	setClaims: true,
	createUser: true,
}

export const paywallGuardianShape: Shape<PaywallGuardianTopic> = {
	grantUserPremium: true,
	revokeUserPremium: true,
}
