
import {ApiShape as RenrakuApiShape} from "renraku/dist/interfaces.js"
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"

import {
	User,
	VaultApi,
	PaywallApi,
	QuestionsApi,
	CoreSecuredApi,
	CoreSystemsApi,
} from "./types.js"

//
// renraku api's
//

export function makeCoreSystemsApiShape<U extends User>(): RenrakuApiShape<CoreSystemsApi<U>> {
	return {
		authAardvark: {
			authorize: "method",
			authenticateViaGoogle: "method",
		},
		userUmbrella: {
			getUser: "method",
			setProfile: "method",
		},
	}
}

export function makeCoreSecureApiShape<U extends User>(): RenrakuApiShape<CoreSecuredApi<U>> {
	return {
		claimsCardinal: {
			writeClaims: "method",
		},
	}
}

export const questionsShape: RenrakuApiShape<QuestionsApi> = {
	questionQuarry: {
		likeQuestion: "method",
		postQuestion: "method",
		archiveBoard: "method",
		fetchQuestions: "method",
		archiveQuestion: "method",
	}
}

export const paywallShape: RenrakuApiShape<PaywallApi> = {
	premiumPachyderm: {
		getPremiumDetails: "method",
		updatePremium: "method",
		cancelPremium: "method",
		checkoutPremium: "method",
	}
}

//
// crosscall api's
//

export const vaultShape: CrosscallApiShape<VaultApi> = {
	tokenStore: {
		clearTokens: "method",
		writeTokens: "method",
		passiveCheck: "method",
		writeAccessToken: "method",
	}
}
