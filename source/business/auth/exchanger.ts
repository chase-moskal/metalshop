
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
	SettingsSheriffTopic,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

export function makeAuthExchanger({
		signToken,
		verifyToken,
		authVanguard,
		generateUserId,
		settingsSheriff,
		profileMagistrate,
		verifyGoogleToken,
		generateRandomNickname,
		accessTokenExpiresMilliseconds,
		refreshTokenExpiresMilliseconds,
	}: {
		signToken: SignToken
		verifyToken: VerifyToken
		generateUserId: () => string
		authVanguard: AuthVanguardTopic
		generateRandomNickname: () => string
		verifyGoogleToken: VerifyGoogleToken
		settingsSheriff: SettingsSheriffTopic
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
			const userId = generateUserId()
			const user = await authVanguard.createUser({
				userId,
				googleId,
				claims: {},
			})

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

			// create default new profile and settings
			try {
				let profile = await profileMagistrate.getProfile({userId})
				if (!profile) {
					profile = {
						userId,
						avatar: null,
						tagline: null,
						joined: Date.now(),
						nickname: generateRandomNickname(),
					}
					await profileMagistrate.setProfile({accessToken, profile})
				}
				await settingsSheriff.setAvatar({accessToken, avatar})
				await settingsSheriff.setAvatarPublicity({
					accessToken,
					avatarPublicity: true,
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
