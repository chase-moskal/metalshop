
import {SettingsSheriffTopic, Settings, SettingsRecord, SettingsDatalayer, AccessToken, ProfileMagistrateTopic, VerifyToken, AccessPayload} from "../../interfaces.js"

const convertToSettings = (record: SettingsRecord): Settings => (
	record
		? {...record}
		: null
)

export function makeSettingsSheriff({
		verifyToken,
		settingsDatalayer,
		profileMagistrate,
	}: {
		verifyToken: VerifyToken
		settingsDatalayer: SettingsDatalayer
		profileMagistrate: ProfileMagistrateTopic
	}): SettingsSheriffTopic {

	async function reflectProfileEffects({userId, record, accessToken}: {
			userId: string
			record: SettingsRecord
			accessToken: AccessToken
		}) {
		const profile = await profileMagistrate.getProfile({userId})
		profile.avatar = record.publicity.avatarPublicity
			? record.avatar
			: null
		await profileMagistrate.setProfile({accessToken, profile})
		return profile
	}

	return {

		async fetchSettings({accessToken}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			return convertToSettings(await settingsDatalayer.getRecord(user.userId))
		},

		async setAdminMode({accessToken, adminMode}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)

			const record = await settingsDatalayer.getRecord(user.userId)
			record.admin.actAsAdmin = adminMode

			await settingsDatalayer.saveRecord(record)
			return convertToSettings(record)
		},

		async setAvatar({accessToken, avatar}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user

			const record = await settingsDatalayer.getOrCreateRecord(userId)
			record.avatar = avatar

			await settingsDatalayer.saveRecord(record)
			const profile = await reflectProfileEffects({
				userId,
				record,
				accessToken,
			})

			return {settings: convertToSettings(record), profile}
		},

		async setAvatarPublicity({accessToken, avatarPublicity}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			const {userId} = user

			const record = await settingsDatalayer.getOrCreateRecord(userId)
			record.publicity.avatarPublicity = avatarPublicity

			const profile = await reflectProfileEffects({
				userId,
				record,
				accessToken,
			})

			return {settings: convertToSettings(record), profile}
		},
	}
}
