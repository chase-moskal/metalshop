
import {SeekerTopic} from "./types.js"
import {isUserAdmin} from "./is-user-admin.js"
import * as convertUserRecord from "../auth/convert-user-record.js"
import {AccessToken, VerifyToken, AccessPayload, Profile, Persona, UserTable, ProfileTable} from "../../interfaces.js"

export function makeSeeker({userTable, profileTable, verifyToken}: {
		userTable: UserTable
		verifyToken: VerifyToken
		profileTable: ProfileTable
	}): SeekerTopic {
	return {

		async search({needle, accessToken}: {
				needle: string
				accessToken: AccessToken
			}) {

			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!isUserAdmin(user)) throw new Error("forbidden")
			if (!needle) return []

			const results = await Promise.all([
				profileTable.read({conditions: {equal: {userId: needle}}}),
				profileTable.read({conditions: {includes: {nickname: needle}}}),
			])

			const profiles: Profile[] = []
			for (const profile of results.flat()) {
				if (!profiles.includes(profile)) {
					profiles.push(profile)
				}
			}

			const promisedPersonas: Promise<Persona>[] = profiles.map(
				async profile => {
					const record = await userTable.one({conditions: {
						equal: {userId: profile.userId}
					}})
					const user = convertUserRecord.toUser(record)
					return {profile, user}
				}
			)

			return await Promise.all(promisedPersonas)
		}
	}
}
