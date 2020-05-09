
import {SettingsSheriffTopic, VerifyToken, SettingsDatalayer, AccessPayload} from "../../interfaces.js"

export function makeSettingsSheriff({
		verifyToken,
		settingsDatalayer,
	}: {
		verifyToken: VerifyToken
		settingsDatalayer: SettingsDatalayer
	}): SettingsSheriffTopic {

	return {
		async fetchSettings({accessToken}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const settings = await settingsDatalayer.getOrCreateSettings(user.userId)
			return settings
		},
		async setAdminMode({accessToken, adminMode}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const settings = await settingsDatalayer.getOrCreateSettings(user.userId)
			settings.admin.actAsAdmin = adminMode
			await settingsDatalayer.saveSettings(settings)
			return settings
		},
	}
}
