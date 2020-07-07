
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {
	ClaimRow,
	AccountRow,
	ProfileRow,
	UserUmbrellaTopic,
} from "../../types.js"

export function makeUserUmbrella(o: {
		claimTable: DbbyTable<ClaimRow>
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
	}): UserUmbrellaTopic {

	return {

		async getUser({userId, accessToken}) {
			throw new Error("TODO implement")
		},

		async setProfile({userId, profile, accessToken}) {
			throw new Error("TODO implement")
		},
	}
}
