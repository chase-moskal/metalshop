
import {ApiShape} from "renraku/dist/interfaces.js"

import {
	ProfilerApi,
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

export const profilerApiShape: ApiShape<ProfilerApi> = {
	profiler: {
		getProfile: true,
		setProfile: true,
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
