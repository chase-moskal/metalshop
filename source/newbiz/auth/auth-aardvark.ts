
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {generateId} from "../../toolbox/generate-id.js"

import {
	User,
	AccessToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	ClaimRow,
	AccountRow,
	ProfileRow,
	AuthAardvarkTopic,
	SignToken,
	VerifyToken,
} from "../../types.js"

import {
	VerifyGoogleToken,
} from "./types.js"

export function makeAuthAardvark({
		accountTable,
		claimTable,
		profileTable,
		generateNickname,
		signToken,
		verifyToken,
		verifyGoogleToken,
	}: {
		claimTable: DbbyTable<ClaimRow>
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
		generateNickname: () => string
		signToken: SignToken
		verifyToken: VerifyToken
		verifyGoogleToken: VerifyGoogleToken
	}): AuthAardvarkTopic {

	async function verifyAccessToken(accessToken: AccessToken) {
		return verifyToken<AccessPayload>(accessToken)
	}

	async function verifyRefreshToken(refreshToken: RefreshToken) {
		return verifyToken<RefreshPayload>(refreshToken)
	}

	async function queryUser(userId: string): Promise<User> {
		const accountRow = await accountTable.one({conditions: {equal: {userId}}})
	}

	async function createUser({googleId, avatar}: {
			avatar: string
			googleId: string
		}): Promise<User> {

		let accountRow = await accountTable.one({conditions: {equal: {googleId}}})
		let claimRow: ClaimRow
		let profileRow: ProfileRow

		// create new user
		if (!accountRow) {
			const userId = generateId()
			accountRow = {
				userId,
				googleId,
				joined: Date.now(),
				lastLogin: Date.now(),
			}
			claimRow = {
				userId,
				admin: false,
				moderator: false,
				staff: false,
			}
			profileRow = {
				userId,
				avatar,
				avatarPublicity: true,
				nickname: generateNickname(),
				tagline: "",
				colors: "",
			}
			await Promise.all([
				accountTable.create(accountRow),
				claimTable.assert({conditions: {equal: {userId}}, fallback: claimRow}),
				profileTable.assert({conditions: {equal: {userId}}, fallback: profileRow}),
			])
		}
		else {
			const userId = accountRow.userId
			claimRow = await claimTable.one({conditions: {equal: {userId}}})
			profileRow = await profileTable.one({conditions: {equal: {userId}}})
		}
	}

	return {

		async authenticateViaGoogle({googleToken}) {
			throw new Error("TODO implement")
		},

		async authorize({refreshToken}) {
			throw new Error("TODO implement")
		},
	}
}
