
import {
	SignToken,
	AuthTokens,
	AccessToken,
	VerifyToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	AuthVanguardTopic,
	VerifyGoogleToken,
	AuthExchangerTopic,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

export function makeAuthExchanger({
		signToken,
		verifyToken,
		authVanguard,
		profileMagistrate,
		verifyGoogleToken,
		generateRandomNickname,
		accessTokenExpiresMilliseconds,
		refreshTokenExpiresMilliseconds,
	}: {
		signToken: SignToken
		verifyToken: VerifyToken
		authVanguard: AuthVanguardTopic
		generateRandomNickname: () => string
		verifyGoogleToken: VerifyGoogleToken
		accessTokenExpiresMilliseconds: number
		refreshTokenExpiresMilliseconds: number
		profileMagistrate: ProfileMagistrateTopic
	}): AuthExchangerTopic {

	async function authenticateViaGoogle({googleToken}: {
			googleToken: string
		}): Promise<AuthTokens> {
		if (googleToken) {

			// verify the google token and extract google user data
			const {googleId, avatar} = await verifyGoogleToken(googleToken)

			// create our own auth user linked to this google id
			const user = await authVanguard.createUser({googleId})
			const {userId} = user

			// generate refresh token so the user can reauthorize
			const refreshToken = await signToken<RefreshPayload>(
				{userId},
				refreshTokenExpiresMilliseconds
			)

			// generate access token so the user can prove authorization
			const accessToken = await signToken<AccessPayload>(
				{user},
				accessTokenExpiresMilliseconds
			)

			// create new profile for this user
			try {
				const profile = await profileMagistrate.getProfile({userId})
				if (!profile)
					await profileMagistrate.setProfile({
						accessToken,
						profile: {
							userId,
							avatar,
							nickname: generateRandomNickname(),
						}
					})
			}
			catch (error) {
				throw new Error(`communications with profile magistrate `
					+ `failed: ${error.message}`)
			}

			return {refreshToken, accessToken}
		}
		else {
			throw new Error(`unknown token`)
		}
	}

	async function authorize({refreshToken}: {
			refreshToken: RefreshToken
		}): Promise<AccessToken> {
		const {userId} = await verifyToken<RefreshPayload>(refreshToken)
		const user = await authVanguard.getUser({userId})
		const accessToken = await signToken<AccessPayload>(
			{user},
			accessTokenExpiresMilliseconds
		)
		return accessToken
	}

	return {
		authorize,
		authenticateViaGoogle,
	}
}
