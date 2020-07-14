
import {ApiShape as RenrakuApiShape} from "renraku/dist/interfaces.js"
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"

import {
	User,
	CoreApi,
	VaultApi,
	PaywallApi,
	QuestionsApi,
} from "./types.js"

//
// renraku api's
//

function makeCoreApiShape<U extends User>(): RenrakuApiShape<CoreApi<U>> {
	return {
		authAardvark: {
			authorize: "method",
			authenticateViaGoogle: "method",
		},
		userUmbrella: {
			getUser: "method",
			setProfile: "method",
		},
		claimsCardinal: {
			setClaims: "method",
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
	paywallPachyderm: {
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
