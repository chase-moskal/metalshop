
import * as renraku from "renraku"

import {
	ProfilerApi,
	AuthExchangerApi,
	ClaimsVanguardApi,
	PaywallGuardianApi,
} from "./interfaces.js"

export const authExchangerApiShape: renraku.ApiShape<AuthExchangerApi> = {
	authExchanger: {
		authorize: true,
		authenticateViaGoogle: true,
	}
}

export const profilerApiShape: renraku.ApiShape<ProfilerApi> = {
	profiler: {
		getProfile: true,
		setProfile: true,
	}
}

export const claimsVanguardApiShape: renraku.ApiShape<ClaimsVanguardApi> = {
	claimsVanguard: {
		createUser: true,
		getUser: true,
		setClaims: true,
	}
}

export const paywallGuardianApiShape: renraku.ApiShape<PaywallGuardianApi> = {
	paywallGuardian: {
		makeUserPremium: true,
		revokeUserPremium: true,
	}
}
