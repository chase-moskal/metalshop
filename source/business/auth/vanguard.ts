
import {
	User,
	UserTable,
	AuthCommon,
} from "../../interfaces.js"

import * as convertUserRecord from "./convert-user-record.js"

export function makeAuthVanguard({userTable, generateUserId}: {
		userTable: UserTable
		generateUserId: () => string
	}): AuthCommon {

	async function getUserRecordByUserId(userId: string) {
		return userTable.one({conditions: {equal: {userId}}})
	}

	async function getUserRecordByGoogleId(googleId: string) {
		return userTable.one({conditions: {equal: {googleId}}})
	}

	async function getUser({userId}: {userId: string}): Promise<User> {
		const record = await getUserRecordByUserId(userId)
		return record
			? convertUserRecord.toUser(record)
			: undefined
	}

	async function createUser({googleId, claims}): Promise<User> {
		let record = await getUserRecordByGoogleId(googleId)
		if (!record) {
			record = {
				claims,
				googleId,
				userId: generateUserId(),
			}
			await userTable.create(record)
		}
		return convertUserRecord.toUser(record)
	}

	async function setClaims({userId, claims}): Promise<User> {
		await userTable.update({
			conditions: {equal: {userId}},
			replace: {claims},
		})
		return convertUserRecord.toUser(
			await getUserRecordByUserId(userId)
		)
	}

	return {

		// must be kept secure, never expose to public
		authVanguard: {getUser, createUser, setClaims},

		// can be exposed publicly on the web
		authDealer: {getUser},
	}
}
