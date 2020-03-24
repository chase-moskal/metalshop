
import {Profile, AccessToken, Topic} from "../../interfaces.js"

export interface ProfileMagistrateTopic extends
	Topic<ProfileMagistrateTopic> {

	getProfile(options: {
		userId: string
	}): Promise<Profile>

	setProfile(options: {
		profile: Profile
		accessToken: AccessToken
	}): Promise<void>
}
