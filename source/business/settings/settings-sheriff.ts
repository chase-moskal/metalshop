
import {SettingsSheriffTopic, Settings, AccessToken, ProfileMagistrateTopic, VerifyToken, SettingsDatalayer, AccessPayload} from "../../interfaces.js"

export function makeSettingsSheriff({
		verifyToken,
		settingsDatalayer,
		profileMagistrate,
	}: {
		verifyToken: VerifyToken
		settingsDatalayer: SettingsDatalayer
		profileMagistrate: ProfileMagistrateTopic
	}): SettingsSheriffTopic {

	async function reflectProfileEffects({userId, settings, accessToken}: {
		userId: string
		settings: Settings
		accessToken: AccessToken
	}) {
		const profile = await profileMagistrate.getProfile({userId})
		profile.avatar = settings.publicity.avatar ? settings.avatar : null
		await profileMagistrate.setProfile({accessToken, profile})
		return profile
	}

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
		async setAvatar({accessToken, avatar}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user
			const settings = await settingsDatalayer.getOrCreateSettings(userId)
			settings.avatar = avatar
			await settingsDatalayer.saveSettings(settings)
			const profile = await reflectProfileEffects({
				userId,
				settings,
				accessToken,
			})
			return {settings, profile}
		},
		async setAvatarPublicity({accessToken, avatar}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user
			const settings = await settingsDatalayer.getOrCreateSettings(userId)
			settings.publicity.avatar = avatar
			const profile = await reflectProfileEffects({
				userId,
				settings,
				accessToken,
			})
			return {settings, profile}
		},
	}
}
