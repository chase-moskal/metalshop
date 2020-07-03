
import {SettingsMaker} from "./interfaces.js"
import {SettingsRecord} from "../../interfaces.js"

export const makeDefaultSettings: SettingsMaker = (userId: string): SettingsRecord => ({
	userId,
	avatar: null,
	admin: {
		actAsAdmin: true,
	},
	billing: {
		premiumSubscription: null,
	},
	publicity: {
		avatarPublicity: true,
	},
	premium: null,
})
