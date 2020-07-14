
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {generateId} from "../../toolbox/generate-id.js"

import {User, AccessToken, Claims, ClaimsRow, SignToken, AccountRow, ProfileRow, VerifyToken, AccessPayload, UserUmbrellaTopic, ClaimsCardinalTopic, RefreshPayload, AuthAardvarkTopic, VerifyGoogleToken} from "../../types.js"

export function makeCoreSystems<U extends User>({
		claimsTable,
		accountTable,
		profileTable,
		expireAccessToken,
		expireRefreshToken,
		signToken,
		verifyToken,
		generateNickname,
		verifyGoogleToken,
	}: {
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
		claimsTable: DbbyTable<ClaimsRow>
		expireAccessToken: number
		expireRefreshToken: number
		signToken: SignToken
		verifyToken: VerifyToken
		verifyGoogleToken: VerifyGoogleToken
		generateNickname: () => string
	}): {
		authAardvark: AuthAardvarkTopic
		userUmbrella: UserUmbrellaTopic<U>
		claimsCardinal: ClaimsCardinalTopic<U>
	} {

	async function verifyMasterScope(accessToken: AccessToken): Promise<U> {
		const {user, scope} = await verifyToken<AccessPayload>(accessToken)
		if (!scope.master) throw new Error("scope forbidden")
		return <U>user
	}

	function assembleUser({
			accountRow,
			claimsRow,
			profileRow,
		}: {
			accountRow: AccountRow
			claimsRow: ClaimsRow
			profileRow: ProfileRow
		}) {
		const {userId: noop1, ...claims} = claimsRow
		const {userId: noop2, ...profile} = profileRow
		const {userId} = accountRow
		return <U>{userId, claims, profile}
	}

	async function fetchUser(userId: string): Promise<U> {
		const userIdConditions = {conditions: {equal: {userId}}}
		const accountRow = await accountTable.one(userIdConditions)
		return assembleUser({
			accountRow,
			...await concurrent({
				claimsRow: claimsTable.one(userIdConditions),
				profileRow: profileTable.one(userIdConditions),
			}),
		})
	}

	async function assertUser({avatar, accountRow}: {
			avatar: string
			accountRow: AccountRow
		}) {
		const {userId} = accountRow
		const userIdConditions = {conditions: {equal: {userId}}}
		return assembleUser({
			accountRow,
			...await concurrent({
				claimsRow: claimsTable.assert({
					...userIdConditions,
					make: async() => ({
						userId,
						admin: false,
						staff: false,
						joined: Date.now(),
						lastLogin: Date.now(),
						banUntil: undefined,
						banReason: undefined,
					}),
				}),
				profileRow: profileTable.assert({
					...userIdConditions,
					make: async() => ({
						userId,
						avatar,
						tagline: "",
						nickname: generateNickname(),
					}),
				}),
			}),
		})
	}

	async function writeClaims(userId: string, claims: Claims) {
		await claimsTable.update({
			conditions: {equal: {userId}},
			write: claims,
		})
	}

	async function userLogin(userId: string) {
		const user = await fetchUser(userId)
		const claims = {...user.claims, lastLogin: Date.now()}
		await writeClaims(userId, claims)
		user.claims = claims
		return user
	}

	return {

		authAardvark: {
			async authenticateViaGoogle({googleToken}) {
				const {googleId, avatar, name} = await verifyGoogleToken(googleToken)
				const accountRow = await accountTable.assert({
					conditions: {equal: {googleId}},
					make: async() => ({
						userId: generateId(),
						name,
						googleId,
					}),
				})
				const user = await assertUser({accountRow, avatar})
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
				const user = await userLogin(userId)
				return signToken<AccessPayload>({user, scope}, expireAccessToken)
			},
		},

		userUmbrella: {
			async getUser({userId}) {
				return fetchUser(userId)
			},
			async setProfile({userId, profile, accessToken}) {
				const askingUser = await verifyMasterScope(accessToken)
				const allowed = (askingUser.claims.admin || askingUser.userId === userId)
				if (!allowed) throw new Error("forbidden")
				await profileTable.update({
					conditions: {equal: {userId}},
					write: profile,
				})
			},
		},

		claimsCardinal: {
			async setClaims({userId, claims}) {
				await writeClaims(userId, claims)
			},
		},
	}
}
