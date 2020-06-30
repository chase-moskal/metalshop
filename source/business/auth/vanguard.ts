
import {
	User,
	AuthCommon,
	UserDatalayer,
} from "../../interfaces.js"

import * as convertUserRecord from "./convert-user-record.js"

export function makeAuthVanguard({userDatalayer, generateUserId}: {
		userDatalayer: UserDatalayer
		generateUserId: () => string
	}): AuthCommon {

	async function getUser({userId}: {userId: string}): Promise<User> {
		const record = await userDatalayer.getRecordByUserId(userId)
		return record
			? convertUserRecord.toUser(record)
			: undefined
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
		return convertUserRecord.toUser(record)
	}

	async function setClaims({userId, claims}): Promise<User> {
		return convertUserRecord.toUser(
			await userDatalayer.setRecordClaims(userId, claims)
		)
	}

	return {

		// must be kept secure, never expose to public
		authVanguard: {getUser, createUser, setClaims},

		// can be exposed publicly on the web
		authDealer: {getUser},
	}
}
