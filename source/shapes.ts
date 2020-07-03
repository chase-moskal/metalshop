
import {ApiShape as RenrakuApiShape} from "renraku/dist/interfaces.js"
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"

import {
	AuthApi,
	VaultApi,
	PaywallApi,
	ProfileApi,
	QuestionsApi,
} from "./interfaces.js"

//
// renraku api's
//

export const authShape: RenrakuApiShape<AuthApi> = {
	authExchanger: {
		authorize: "method",
		authenticateViaGoogle: "method",
	},
	authVanguard: {
		getUser: "method",
		setClaims: "method",
		createUser: "method",
	},
	authDealer: {
		getUser: "method",
	}
}

export const profileShape: RenrakuApiShape<ProfileApi> = {
	profileMagistrate: {
		setProfile: "method",
		getProfile: "method",
	}
}

export const questionsShape: RenrakuApiShape<QuestionsApi> = {
	questionsBureau: {
		likeQuestion: "method",
		postQuestion: "method",
		archiveBoard: "method",
		fetchQuestions: "method",
		archiveQuestion: "method",
	}
}

export const paywallShape: RenrakuApiShape<PaywallApi> = {
	paywallLiaison: {
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
