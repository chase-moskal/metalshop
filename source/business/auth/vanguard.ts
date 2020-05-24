
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

export function makeAuthVanguard({userDatalayer, generateUserId}: {
		userDatalayer: UserDatalayer
		generateUserId: () => string
	}): AuthCommon {

	async function getUser({userId}: {userId: string}): Promise<User> {
		const record = await userDatalayer.getRecordByUserId(userId)
		return record ? toUser(record) : undefined
	}

	async function createUser({googleId, claims}): Promise<User> {
		let record = await userDatalayer.getRecordByGoogleId(googleId)
		if (!record) {
			record = {
				claims,
				googleId,
				userId: generateUserId(),
			}
			await userDatalayer.insertRecord(record)
		}
		return toUser(record)
	}

	async function setClaims({userId, claims}): Promise<User> {
		return toUser(await userDatalayer.setRecordClaims(userId, claims))
	}

	return {

		// must be kept secure, never expose to public
		authVanguard: {getUser, createUser, setClaims},

		// can be exposed publicly on the web
		authDealer: {getUser},
	}
}
