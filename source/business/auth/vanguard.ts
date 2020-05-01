
import {
	User,
	AuthCommon,
	UserRecord,
	UserDatalayer,
} from "../../interfaces.js"

const toUser = ({userId, claims}: UserRecord): User => ({
	claims,
	userId,
})

export function makeAuthVanguard({userDatalayer}: {
		userDatalayer: UserDatalayer
	}): AuthCommon {

	async function getUser({userId}: {userId: string}): Promise<User> {
		const record = await userDatalayer.getRecordByUserId(userId)
		return record ? toUser(record) : undefined
	}

	async function createUser({googleId}): Promise<User> {
		let record = await userDatalayer.getRecordByGoogleId(googleId)
		if (!record) {
			record = await userDatalayer.insertRecord({
				googleId,
				claims: {},
			})
		}
		return toUser(record)
	}

	async function setClaims({userId, claims = {}}): Promise<User> {
		return toUser(await userDatalayer.setRecordClaims(userId, claims))
	}

	return {

		// must be kept secure, never expose to public
		authVanguard: {getUser, createUser, setClaims},

		// can be exposed publicly on the web
		authDealer: {getUser},
	}
}
