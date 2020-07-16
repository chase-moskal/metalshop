
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {generateId} from "../../toolbox/generate-id.js"

import {User, Profile, AccessToken, ClaimsRow, SignToken, AccountRow, ProfileRow, VerifyToken, AccessPayload, UserUmbrellaTopic, RefreshPayload, AuthAardvarkTopic, VerifyGoogleToken} from "../../types.js"

function defaultValidateProfile(profile: Profile): boolean {
	// TODO implement some reasonable validation
	return !!profile
}

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
		validateProfile = defaultValidateProfile,
	}: {
		expireAccessToken: number
		expireRefreshToken: number
		claimsTable: DbbyTable<ClaimsRow>
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
		signToken: SignToken
		verifyToken: VerifyToken
		generateNickname: () => string
		verifyGoogleToken: VerifyGoogleToken
		validateProfile?: (profile: Profile) => boolean
	}): {
		authAardvark: AuthAardvarkTopic
		userUmbrella: UserUmbrellaTopic<U>
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

	async function updateClaims(userId: string, claims: Partial<U["claims"]>) {
		await claimsTable.update({
			conditions: {equal: {userId}},
			write: claims,
		})
	}

	async function userLogin(userId: string) {
		const user = await fetchUser(userId)
		const claims = {...user.claims, lastLogin: Date.now()}
		await updateClaims(userId, claims)
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
						googleName: name,
						googleAvatar: avatar,
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
				if (!validateProfile(profile)) throw new Error("invalid profile")
				await profileTable.update({
					conditions: {equal: {userId}},
					write: profile,
				})
			},
		},
	}
}
