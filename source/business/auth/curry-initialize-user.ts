
import {InitializeUser} from "../../interfaces.js"
import {SettingsSheriffTopic} from "../settings/interfaces.js"
import {ProfileMagistrateTopic} from "../profile/interfaces.js"

export function curryInitializeUser({
		settingsSheriff,
		profileMagistrate,
		generateRandomNickname,
	}: {
		generateRandomNickname: () => string
		settingsSheriff: SettingsSheriffTopic
		profileMagistrate: ProfileMagistrateTopic
	}): InitializeUser {

	return async function({userId, avatar, accessToken}) {
		let profile = await profileMagistrate.getProfile({userId})
		if (!profile) {
			profile = {
				userId,
				avatar: null,
				tagline: null,
				joined: Date.now(),
				nickname: generateRandomNickname(),
			}
			await profileMagistrate.setProfile({accessToken, profile})
		}
		await settingsSheriff.setAvatar({accessToken, avatar})
		await settingsSheriff.setAvatarPublicity({
			accessToken,
			avatarPublicity: true,
		})
	}
}
