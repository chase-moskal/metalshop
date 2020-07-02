
import {
	SignToken,
	AuthTokens,
	AccessToken,
	VerifyToken,
	RefreshToken,
	AccessPayload,
	RefreshPayload,
	InitializePersona,
	AuthVanguardTopic,
	VerifyGoogleToken,
	AuthExchangerTopic,
} from "../../interfaces.js"

export function makeAuthExchanger({
		signToken,
		verifyToken,
		authVanguard,
		initializePersona,
		verifyGoogleToken,
		accessTokenExpiresMilliseconds,
		refreshTokenExpiresMilliseconds,
	}: {
		signToken: SignToken
		verifyToken: VerifyToken
		initializePersona: InitializePersona
		authVanguard: AuthVanguardTopic
		verifyGoogleToken: VerifyGoogleToken
		accessTokenExpiresMilliseconds: number
		refreshTokenExpiresMilliseconds: number
	}): AuthExchangerTopic {

	async function authenticateViaGoogle({googleToken}: {
			googleToken: string
		}): Promise<AuthTokens> {
		if (googleToken) {

			// verify the google token and extract google user data
			const {googleId, avatar} = await verifyGoogleToken(googleToken)

			// create our own auth user linked to this google id
			const user = await authVanguard.createUser({
				googleId,
				claims: {},
			})
			const {userId} = user

			// generate refresh token so the user can reauthorize
			const refreshToken = await signToken<RefreshPayload>(
				{userId},
				refreshTokenExpiresMilliseconds,
			)

			// generate access token so the user can prove authorization
			const accessToken = await signToken<AccessPayload>(
				{user},
				accessTokenExpiresMilliseconds,
			)

			// outsource user initialization
			try {
				await initializePersona({userId, avatar, accessToken})
			}
			catch (error) {
				error.message = `failed to initialize user: ${error.message}`
				throw error
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
