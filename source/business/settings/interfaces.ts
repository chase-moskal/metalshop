
import {Topic, AccessToken, Settings} from "../../interfaces.js"

export type SettingsMaker = (userId: string) => Settings

export interface SettingsDatalayer {
	saveSettings(settings: Settings): Promise<void>
	getOrCreateSettings(userId: string): Promise<Settings>
}

export interface SettingsSheriffTopic extends Topic<SettingsSheriffTopic> {
	fetchSettings(options: {accessToken: AccessToken}): Promise<Settings>
}
