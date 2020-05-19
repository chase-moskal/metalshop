
import {SettingsSheriffTopic, ProfileMagistrateTopic, VerifyToken, SettingsDatalayer, AccessPayload} from "../../interfaces.js"

export function makeSettingsSheriff({
		verifyToken,
		settingsDatalayer,
		profileMagistrate,
	}: {
		verifyToken: VerifyToken
		settingsDatalayer: SettingsDatalayer
		profileMagistrate: ProfileMagistrateTopic
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
		async setAvatarPublicity({accessToken, avatar}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user
			const settings = await settingsDatalayer.getOrCreateSettings(userId)
			settings.publicity.avatar = avatar
			const profile = await profileMagistrate.getProfile({userId})
			profile.avatar = avatar ? settings.avatar : null
			await profileMagistrate.setProfile({accessToken, profile})
			return {settings, profile}
		},
	}
}
