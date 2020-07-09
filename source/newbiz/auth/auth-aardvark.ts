
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {generateId} from "../../toolbox/generate-id.js"

import {
	SignToken,
	AccountRow,
	VerifyToken,
	AccessPayload,
	UserDatalayer,
	RefreshPayload,
	AuthAardvarkTopic,
	VerifyGoogleToken,
} from "../../types.js"

export function makeAuthAardvark<U>({
		accountTable,
		userDatalayer,
		signToken,
		verifyToken,
		verifyGoogleToken,
		expireAccessToken,
		expireRefreshToken,
	}: {
		accountTable: DbbyTable<AccountRow>
		userDatalayer: UserDatalayer
		signToken: SignToken
		verifyToken: VerifyToken
		verifyGoogleToken: VerifyGoogleToken
		expireAccessToken: number
		expireRefreshToken: number
	}): AuthAardvarkTopic {

	return {

		async authenticateViaGoogle({googleToken}) {
			const {googleId, avatar, name} = await verifyGoogleToken(googleToken)
			const accountRow = await accountTable.assert({
				conditions: {equal: {googleId}},
				make: () => ({
					userId: generateId(),
					googleId,
					name,
					joined: Date.now(),
					lastLogin: Date.now(),
				})
			})
			const user = await userDatalayer.assertUser({accountRow, avatar})
			return concurrent({
				accessToken: signToken<AccessPayload>({user}, expireAccessToken),
				refreshToken: signToken<RefreshPayload>(
					{userId: accountRow.userId},
					expireRefreshToken
				),
			})
		},

		async authorize({refreshToken}) {
			const {userId} = await verifyToken<RefreshPayload>(refreshToken)
			const user = await userDatalayer.getUser({userId})
			return signToken<AccessPayload>({user}, expireAccessToken)
		},
	}
}
