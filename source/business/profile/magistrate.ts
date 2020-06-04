
import {
	Profile,
	VerifyToken,
	AccessToken,
	ProfileRecord,
	AccessPayload,
	ProfileDatalayer,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

const toProfile = (record: ProfileRecord): Profile => (
	record
		? {
			userId: record.userId,
			avatar: record.avatar,
			joined: record.joined,
			tagline: record.tagline,
			nickname: record.nickname,
		}
		: null
)

const limitLength = (limit: number, value: string) => {
	if (value && value.length > limit)
		throw new Error(`bad request`)
}

export function makeProfileMagistrate({verifyToken, profileDatalayer}: {
		verifyToken: VerifyToken
		profileDatalayer: ProfileDatalayer
	}): ProfileMagistrateTopic {

	async function getProfile({userId}: {
			userId: string
		}): Promise<Profile> {
		return toProfile(await profileDatalayer.getRecordByUserId(userId))
	}

	async function setProfile({profile, accessToken}: {
			profile: Profile
			accessToken: AccessToken
		}): Promise<void> {

		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId} = user
		const authorized = !!user.claims.admin || (profile.userId === userId)
		if (!authorized) throw new Error(`unauthorized`)

		const {avatar, nickname, joined, tagline} = profile
		limitLength(1000, avatar)
		limitLength(1000, tagline)
		limitLength(1000, nickname)
		if (!(typeof joined === "number")) throw new Error(`joined must be number`)

		await profileDatalayer.upsertRecord({
			userId,
			avatar,
			joined,
			tagline,
			nickname,
		})
	}

	return {
		getProfile,
		setProfile,
	}
}
