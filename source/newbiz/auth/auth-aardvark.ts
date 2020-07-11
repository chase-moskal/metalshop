
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {generateId} from "../../toolbox/generate-id.js"

import {
	Scope,
	SignToken,
	AccountRow,
	VerifyToken,
	AccessPayload,
	UserDatalayer,
	RefreshPayload,
	AuthAardvarkTopic,
	VerifyGoogleToken,
} from "../../types.js"

export function makeAuthAardvark({
		accountTable,
		userDatalayer,
		expireAccessToken,
		expireRefreshToken,
		signToken,
		verifyToken,
		verifyGoogleToken,
	}: {
		accountTable: DbbyTable<AccountRow>
		userDatalayer: UserDatalayer
		expireAccessToken: number
		expireRefreshToken: number
		signToken: SignToken
		verifyToken: VerifyToken
		verifyGoogleToken: VerifyGoogleToken
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
				accessToken: signToken<AccessPayload>(
					{user, scope: {master: true}},
					expireAccessToken
				),
				refreshToken: signToken<RefreshPayload>(
					{userId: accountRow.userId},
					expireRefreshToken
				),
			})
		},

		async authorize({refreshToken, scope}) {
			const {userId} = await verifyToken<RefreshPayload>(refreshToken)
			const user = await userDatalayer.getUser({userId})
			return signToken<AccessPayload>({user, scope}, expireAccessToken)
		},
	}
}
