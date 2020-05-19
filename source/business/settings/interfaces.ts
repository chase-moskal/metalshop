
import {Topic, AccessToken, Settings, Profile} from "../../interfaces.js"

export type SettingsMaker = (userId: string) => Settings

export interface SettingsDatalayer {
	saveSettings(settings: Settings): Promise<void>
	getOrCreateSettings(userId: string): Promise<Settings>
}

export interface SettingsSheriffTopic extends Topic<SettingsSheriffTopic> {
	fetchSettings(options: {accessToken: AccessToken}): Promise<Settings>
	setAvatar(options: {
			accessToken: AccessToken
			avatar: string
		}): Promise<{settings: Settings; profile: Profile}>
	setAvatarPublicity(options: {
			accessToken: AccessToken
			avatar: boolean
		}): Promise<{settings: Settings; profile: Profile}>
	setAdminMode(options: {
			accessToken: AccessToken
			adminMode: boolean
		}): Promise<Settings>
}
