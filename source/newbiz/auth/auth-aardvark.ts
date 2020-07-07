
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {
	ClaimRow,
	AccountRow,
	ProfileRow,
	AuthAardvarkTopic,
} from "../../types.js"

export function makeAuthAardvark(o: {
		claimTable: DbbyTable<ClaimRow>
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
	}): AuthAardvarkTopic {

	return {

		async authorize({refreshToken}) {
			throw new Error("TODO implement")
		},

		async authenticateViaGoogle({googleToken}) {
			throw new Error("TODO implement")
		},
	}
}
