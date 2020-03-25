
import {
	User,
	UsersData,
	UserRecord,
	AuthCommon,
} from "../../interfaces.js"

const toUser = ({userId, claims}: UserRecord): User => ({
	claims,
	userId,
})

export function createAuthVanguard({usersData}: {
	usersData: UsersData
}): AuthCommon {

	async function getUser({userId}: {userId: string}): Promise<User> {
		return toUser(await usersData.getRecordByUserId(userId))
	}

	async function createUser({googleId}): Promise<User> {
		let record = await usersData.getRecordByGoogleId(googleId)
		if (!record) {
			record = await usersData.insertRecord({
				googleId,
				claims: {},
			})
		}
		return toUser(record)
	}

	async function setClaims({userId, claims = {}}): Promise<User> {
		return toUser(await usersData.setRecordClaims(userId, claims))
	}

	return {

		// must be kept secure
		authVanguard: {getUser, createUser, setClaims},

		// can be exposed publicly on the web
		authDealer: {getUser},
	}
}
