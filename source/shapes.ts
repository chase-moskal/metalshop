
import {ApiShape} from "renraku/dist/interfaces.js"

import {
	ProfileMagistrateApi,
	AuthExchangerApi,
	ClaimsVanguardApi,
	PaywallGuardianApi,
} from "./interfaces.js"

export const authExchangerApiShape: ApiShape<AuthExchangerApi> = {
	authExchanger: {
		authorize: true,
		authenticateViaGoogle: true,
	}
}

export const profileMagistrateApiShape: ApiShape<ProfileMagistrateApi> = {
	profileMagistrate: {
		getFullProfile: true,
		setFullProfile: true,
		getPublicProfile: true,
	}
}

export const claimsVanguardApiShape: ApiShape<ClaimsVanguardApi> = {
	claimsVanguard: {
		createUser: true,
		getUser: true,
		setClaims: true,
	}
}

export const paywallGuardianApiShape: ApiShape<PaywallGuardianApi> = {
	paywallGuardian: {
		makeUserPremium: true,
		revokeUserPremium: true,
	}
}
