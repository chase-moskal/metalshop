
import {ApiShape as RenrakuApiShape} from "renraku/dist/interfaces.js"
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"

import {
	AuthApi,
	PaywallApi,
	ProfileApi,
	QuestionsApi,
	TokenStorageApi,
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
		deleteQuestion: "method",
		fetchQuestions: "method",
		purgeQuestions: "method",
	}
}

export const paywallShape: RenrakuApiShape<PaywallApi> = {
	stripeLiaison: {
		unlink: "method",
		setPremiumAutoRenew: "method",
		createSessionForLinking: "method",
		createSessionForPremium: "method",
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
