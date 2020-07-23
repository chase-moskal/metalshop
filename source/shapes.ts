
import {ApiShape as RenrakuApiShape} from "renraku/dist/interfaces.js"
import {ApiShape as CrosscallApiShape} from "crosscall/dist/interfaces.js"

import {
	User,
	VaultApi,
	PaywallApi,
	LiveshowApi,
	SettingsApi,
	ScheduleApi,
	QuestionsApi,
	CoreSecuredApi,
	CoreSystemsApi,
} from "./types.js"

//
// renraku api's
//

export const coreSystemsShape: RenrakuApiShape<CoreSystemsApi<User>> = {
	authAardvark: {
		authorize: "method",
		authenticateViaGoogle: "method",
	},
	userUmbrella: {
		getUser: "method",
		setProfile: "method",
	},
}

export const coreSecuredShape: RenrakuApiShape<CoreSecuredApi<User>> = {
	claimsCardinal: {
		writeClaims: "method",
	},
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

export const liveshowShape: RenrakuApiShape<LiveshowApi> = {
	liveshowLizard: {
		getShow: "method",
		setShow: "method",
	}
}

export const settingsShape: RenrakuApiShape<SettingsApi> = {
	settingsSheriff: {
		fetchSettings: "method",
		setActAsAdmin: "method",
	}
}

export const scheduleShape: RenrakuApiShape<ScheduleApi> = {
	scheduleSentry: {
		getEvent: "method",
		setEvent: "method",
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
