
import {Topic, AccessToken, Settings, SettingsRecord, Profile} from "../../interfaces.js"

export type SettingsMaker = (userId: string) => SettingsRecord

export interface SettingsDatalayer {
	getRecord(userId: string): Promise<SettingsRecord>
	getOrCreateRecord(userId: string): Promise<SettingsRecord>
	saveRecord(record: SettingsRecord): Promise<void>
}

export interface SettingsSheriffTopic extends Topic<SettingsSheriffTopic> {
	fetchSettings(options: {accessToken: AccessToken}): Promise<Settings>
	setAvatar(options: {
			accessToken: AccessToken
			avatar: string
		}): Promise<{settings: Settings; profile: Profile}>
	setAvatarPublicity(options: {
			accessToken: AccessToken
			avatarPublicity: boolean
		}): Promise<{settings: Settings; profile: Profile}>
	setAdminMode(options: {
			accessToken: AccessToken
			adminMode: boolean
		}): Promise<Settings>
}
