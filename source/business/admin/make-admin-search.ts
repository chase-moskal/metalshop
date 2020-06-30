
import {isUserAdmin} from "./is-user-admin.js"
import {first} from "../../toolbox/dbby/first.js"
import * as convertUserRecord from "../auth/convert-user-record.js"
import {AdminSearchTopic, UserTable, ProfileTable} from "./types.js"
import {AccessToken, VerifyToken, AccessPayload, Profile, Persona} from "../../interfaces.js"

export function makeAdminSearch({userTable, profileTable, verifyToken}: {
		userTable: UserTable
		verifyToken: VerifyToken
		profileTable: ProfileTable
	}): AdminSearchTopic {
	return {

		async search({needle, accessToken}: {
				needle: string
				accessToken: AccessToken
			}) {

			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!isUserAdmin(user)) throw new Error("forbidden")
			if (!needle) return []

			const results = await Promise.all([
				profileTable.read({equal: {userId: needle}}),
				profileTable.read({includes: {nickname: needle}}),
			])

			const profiles: Profile[] = []
			for (const profile of results.flat()) {
				if (!profiles.includes(profile)) {
					profiles.push(profile)
				}
			}

			const promisedPersonas: Promise<Persona>[] = profiles.map(
				async profile => {
					const record = first(await userTable.read({equal: {
						userId: profile.userId
					}}))
					const user = convertUserRecord.toUser(record)
					return {profile, user}
				}
			)

			return await Promise.all(promisedPersonas)
		}
	}
}
