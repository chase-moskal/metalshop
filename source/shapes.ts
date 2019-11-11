
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"
import {ApiShape as RenrakuApiShape, Shape} from "renraku/dist/interfaces.js"

import {
	AuthServerApi,
	ProfileMagistrateCacheApi,
	PaywallServerApi,
	ProfileServerApi,
	ProfileMagistrateTopic,
	TokenStorageApi,
} from "./interfaces.js"

//
// RENRAKU APIs
//

export const authServerShape: RenrakuApiShape<AuthServerApi> = {
	claimsDealer: {
		getPublicUser: "method",
	},
	authExchanger: {
		authorize: "method",
		authenticateViaGoogle: "method",
	},
	claimsVanguard: {
		getUser: "method",
		setClaims: "method",
		createUser: "method",
	}
}

const profileMagistrateMethodsShape: Shape<ProfileMagistrateTopic> = {
	setFullProfile: "method",
	getFullProfile: "method",
	getPublicProfile: "method",
}

export const profileServerShape: RenrakuApiShape<ProfileServerApi> = {
	profileMagistrate: profileMagistrateMethodsShape
}

export const paywallServerShape: RenrakuApiShape<PaywallServerApi> = {
	paywallGuardian: {
		grantUserPremium: "method",
		revokeUserPremium: "method",
	}
}

//
// CROSSCALL APIs
//

export const tokenStorageShape: CrosscallApiShape<TokenStorageApi> = {
	tokenStorage: {
		clearTokens: "method",
		writeTokens: "method",
		passiveCheck: "method",
		writeAccessToken: "method",
	}
}

export const profileMagistrateCacheShape:
 CrosscallApiShape<ProfileMagistrateCacheApi> = {
	profileMagistrateCache: profileMagistrateMethodsShape,
}
