
import {MetalUser, AccessToken, ClaimsRow, SignToken, AccountRow, ProfileRow, VerifyToken, AccessPayload, UserUmbrellaTopic, RefreshPayload, AuthAardvarkTopic} from "../../types.js"

import {concurrent} from "../../toolbox/concurrent.js"
import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"

import {VerifyGoogleToken} from "./types.js"
import {validateProfile as defaultValidateProfile} from "./validate-profile.js"

export function makeAuthSystems<U extends MetalUser>({
		claimsTable,
		accountTable,
		profileTable,
		accessTokenLifespan,
		refreshTokenLifespan,
		signToken,
		generateId,
		verifyToken,
		generateNickname,
		verifyGoogleToken,
		validateProfile = defaultValidateProfile,
	}: {
		accessTokenLifespan: number
		refreshTokenLifespan: number
		claimsTable: DbbyTable<ClaimsRow>
		accountTable: DbbyTable<AccountRow>
		profileTable: DbbyTable<ProfileRow>
		signToken: SignToken
		verifyToken: VerifyToken
		generateId: () => string
		generateNickname: () => string
		verifyGoogleToken: VerifyGoogleToken
		validateProfile?: (profile: U["profile"]) => {problems: string[]}
	}): {
		authAardvark: AuthAardvarkTopic
		userUmbrella: UserUmbrellaTopic<U>
	} {

	async function verifyScope(accessToken: AccessToken): Promise<U> {
		const {user, scope} = await verifyToken<AccessPayload>(accessToken)
		if (!scope.core) throw new Error("forbidden scope")
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
		const userIdConditions = {conditions: and({equal: {userId}})}
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
		const userIdConditions = {conditions: and({equal: {userId}})}
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
						banUntil: undefined,
						banReason: undefined,
						premiumUntil: undefined,
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

	async function updateClaims(
			userId: string,
			claims: Partial<U["claims"]>
		) {
		await claimsTable.update({
			conditions: and({equal: {userId}}),
			write: claims,
		})
	}

	async function userLogin(userId: string) {
		const user = await fetchUser(userId)
		const claims = {...user.claims}
		await updateClaims(userId, claims)
		user.claims = claims
		return user
	}

	return {
		authAardvark: {
			async authenticateViaGoogle({googleToken}) {
				const {googleId, avatar, name} = await verifyGoogleToken(googleToken)
				const accountRow = await accountTable.assert({
					conditions: and({equal: {googleId}}),
					make: async() => ({
						userId: generateId(),
						googleId,
						googleAvatar: avatar,
					}),
				})
				const user = await assertUser({accountRow, avatar})
				return concurrent({
					accessToken: signToken<AccessPayload>({
						payload: {user, scope: {core: true}},
						lifespan: accessTokenLifespan,
					}),
					refreshToken: signToken<RefreshPayload>({
						payload: {userId: accountRow.userId},
						lifespan: refreshTokenLifespan,
					}),
				})
			},
			async authorize({refreshToken, scope}) {
				const {userId} = await verifyToken<RefreshPayload>(refreshToken)
				const user = await userLogin(userId)
				return signToken<AccessPayload>({
					payload: {user, scope},
					lifespan: accessTokenLifespan,
				})
			},
		},

		userUmbrella: {
			async getUser({userId}) {
				return fetchUser(userId)
			},
			async setProfile({userId, profile, accessToken}) {
				const askingUser = await verifyScope(accessToken)
				const allowed = false
					|| askingUser.claims.admin
					|| askingUser.userId === userId
				if (!allowed) throw new Error("forbidden")
				const {problems} = validateProfile(profile)
				if (problems.length) throw new Error(`invalid profile: ${problems.join("; ")}`)
				await profileTable.update({
					conditions: and({equal: {userId}}),
					write: profile,
				})
			},
		},
	}
}
