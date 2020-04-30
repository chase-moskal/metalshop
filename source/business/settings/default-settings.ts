
import {Settings} from "../../interfaces.js"
import {SettingsMaker} from "./interfaces.js"

export const makeDefaultSettings: SettingsMaker =
		(userId: string): Settings => ({

	userId,
	avatar: null,
	admin: {
		actAsAdmin: true,
	},
	billing: {
		premiumSubscription: null,
	},
	premium: null,
})
