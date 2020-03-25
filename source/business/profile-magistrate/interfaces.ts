
import {Profile, AccessToken, Topic} from "../../interfaces.js"

export interface ProfileRecord extends Profile {}

export interface ProfileDatalayer {
	getRecordByUserId(userId: string): Promise<ProfileRecord>
	upsertRecord(record: ProfileRecord): Promise<void>
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
