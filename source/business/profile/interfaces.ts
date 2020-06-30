
import {Profile, AccessToken, Topic} from "../../interfaces.js"

export interface ProfileDatalayer {
	getRecordByUserId(userId: string): Promise<Profile>
	upsertRecord(record: Profile): Promise<void>
}

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
