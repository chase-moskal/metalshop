
import {asTopic} from "renraku/dist/interfaces.js"
import {topicTransform} from "renraku/dist/curries.js"
import {Profile, VerifyToken, SignToken, AccessToken, RefreshToken, RefreshPayload, AccessPayload, AppToken, AppPayload} from "../../types.js"

export function makeAuthApi({signToken, verifyToken}: {
		signToken: SignToken
		verifyToken: VerifyToken
	}) {

	const processAppToken = async({appToken}: {appToken: AppToken}) => ({
		app: await verifyToken<AppPayload>(appToken)
	})

	const processBothTokens = async({appToken, accessToken}: {
			appToken: AppToken
			accessToken: AccessToken
		}) => ({
		app: await verifyToken<AppPayload>(appToken),
		access: await verifyToken<AccessPayload>(accessToken),
	})

	//

	// async function verifyScope(accessToken: AccessToken): Promise<U> {
	// 	const {user, scope} = await verifyToken<AccessPayload>(accessToken)
	// 	if (!scope.core) throw new Error("forbidden scope")
	// 	return <U>user
	// }

	// function assembleUser({
	// 		accountRow,
	// 		claimsRow,
	// 		profileRow,
	// 	}: {
	// 		accountRow: AccountRow
	// 		claimsRow: ClaimsRow
	// 		profileRow: ProfileRow
	// 	}) {
	// 	const {userId: noop1, ...claims} = claimsRow
	// 	const {userId: noop2, ...profile} = profileRow
	// 	const {userId} = accountRow
	// 	return <U>{userId, claims, profile}
	// }

	// async function fetchUser(userId: string): Promise<U> {
	// 	const userIdConditions = {conditions: and({equal: {userId}})}
	// 	const accountRow = await accountTable.one(userIdConditions)
	// 	return assembleUser({
	// 		accountRow,
	// 		...await concurrent({
	// 			claimsRow: claimsTable.one(userIdConditions),
	// 			profileRow: profileTable.one(userIdConditions),
	// 		}),
	// 	})
	// }

	// async function assertUser({avatar, accountRow}: {
	// 		avatar: string
	// 		accountRow: AccountRow
	// 	}) {
	// 	const {userId} = accountRow
	// 	const userIdConditions = {conditions: and({equal: {userId}})}
	// 	return assembleUser({
	// 		accountRow,
	// 		...await concurrent({
	// 			claimsRow: claimsTable.assert({
	// 				...userIdConditions,
	// 				make: async() => ({
	// 					userId,
	// 					admin: false,
	// 					staff: false,
	// 					joined: Date.now(),
	// 					banUntil: undefined,
	// 					banReason: undefined,
	// 					premiumUntil: undefined,
	// 				}),
	// 			}),
	// 			profileRow: profileTable.assert({
	// 				...userIdConditions,
	// 				make: async() => ({
	// 					userId,
	// 					avatar,
	// 					tagline: "",
	// 					nickname: generateNickname(),
	// 				}),
	// 			}),
	// 		}),
	// 	})
	// }

	// async function updateClaims(
	// 		userId: string,
	// 		claims: Partial<U["claims"]>
	// 	) {
	// 	await claimsTable.update({
	// 		conditions: and({equal: {userId}}),
	// 		write: claims,
	// 	})
	// }

	// async function userLogin(userId: string) {
	// 	const user = await fetchUser(userId)
	// 	const claims = {...user.claims}
	// 	await updateClaims(userId, claims)
	// 	user.claims = claims
	// 	return user
	// }

	async function processBothTokensAndForceRootApp(meta: {
			appToken: AppToken
			accessToken: AccessToken
		}) {
		const {app, access} = await processBothTokens(meta)
		if (!app.root) throw new Error("apps topic is root-only")
		return {app, access}
	}

	return {

		appsTopic: topicTransform(processBothTokensAndForceRootApp, {
			async listApps({app, access}, o: {
					userId: string
				}) {},
			async registerApp({app, access}, o: {
					userId: string
					appDraft: any
				}) {},
			async deleteApp({app, access}, o: {
					userId: string
					appId: string
				}) {},
			async createAppToken({app, access}, o: {
					userId: string
					appId: string
					appTokenDraft: any
				}) {},
			async deleteAppToken({app, access}, o: {
					userId: string
					appTokenId: string
				}) {},
		}),

		authTopic: topicTransform(processAppToken, {
			async authenticateViaGoogle({app}, {googleToken}: {googleToken: string}) {
				// const {googleId, avatar, name} = await verifyGoogleToken(googleToken)
				// const accountRow = await accountTable.assert({
				// 	conditions: and({equal: {googleId}}),
				// 	make: async() => ({
				// 		userId: generateId(),
				// 		googleId,
				// 		googleAvatar: avatar,
				// 	}),
				// })
				// const user = await assertUser({accountRow, avatar})
				// return concurrent({
				// 	accessToken: signToken<AccessPayload>({
				// 		payload: {user, scope: {core: true}},
				// 		lifespan: accessTokenLifespan,
				// 	}),
				// 	refreshToken: signToken<RefreshPayload>({
				// 		payload: {userId: accountRow.userId},
				// 		lifespan: refreshTokenLifespan,
				// 	}),
				// })
			},
			async authorize({app}, {refreshToken}: {refreshToken: RefreshToken}) {
				// const {userId} = await verifyToken<RefreshPayload>(refreshToken)
				// const user = await userLogin(userId)
				// return signToken<AccessPayload>({
				// 	payload: {user, scope},
				// 	lifespan: accessTokenLifespan,
				// })
			},
		}),

		userTopic: topicTransform(processBothTokens, {
			async getUser({app, access}, {userId}: {userId: string}) {
				// return fetchUser(userId)
			},
			async setUserProfile({app, access}, {userId, profile}: {userId: string, profile: Profile}) {
				// const askingUser = await verifyScope(accessToken)
				// const allowed = false
				// 	|| askingUser.claims.admin
				// 	|| askingUser.userId === userId
				// if (!allowed) throw new Error("forbidden")
				// const {problems} = validateProfile(profile)
				// if (problems.length) throw new Error(`invalid profile: ${problems.join("; ")}`)
				// await profileTable.update({
				// 	conditions: and({equal: {userId}}),
				// 	write: profile,
				// })
			},
		}),
	}
}
