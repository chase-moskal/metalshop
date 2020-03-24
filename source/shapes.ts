
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"
import {ApiShape as RenrakuApiShape, Shape} from "renraku/dist/interfaces.js"

import {
	AuthApi,
	PaywallApi,
	ProfileApi,
	TokenStorageApi,
	ProfileMagistrateTopic,
} from "./interfaces.js"

//
// renraku api's
//

export const authShape: RenrakuApiShape<AuthApi> = {
	authExchanger: {
		authorize: "method",
		authenticateViaGoogle: "method",
	},
	claimsVanguard: {
		setClaims: "method",
		createUser: "method",
	},
	claimsDealer: {
		getUser: "method",
	}
}

const magistrateShape: Shape<ProfileMagistrateTopic> = {
	setProfile: "method",
	getProfile: "method",
}

export const profileShape: RenrakuApiShape<ProfileApi> = {
	profileMagistrate: magistrateShape
}

export const paywallShape: RenrakuApiShape<PaywallApi> = {
	paywallGuardian: {
		grantUserPremium: "method",
		revokeUserPremium: "method",
	}
}

//
// crosscall api's
//

export const tokenStorageShape: CrosscallApiShape<TokenStorageApi> = {
	tokenStorage: {
		clearTokens: "method",
		writeTokens: "method",
		passiveCheck: "method",
		writeAccessToken: "method",
	}
}
