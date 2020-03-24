
import {Topic} from "renraku/dist/interfaces.js"
import {User, Claims, Profile} from "./common.js"
import {AccessToken, RefreshToken, PaypalToken, AuthTokens} from "./tokens.js"

export interface AuthExchangerTopic extends Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export interface TokenStorageTopic extends Topic<TokenStorageTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
	writeAccessToken(accessToken: AccessToken): Promise<void>
}

export interface AccountPopupTopic extends Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}

export interface ProfileMagistrateTopic extends
 Topic<ProfileMagistrateTopic> {
	getProfile(options: {userId: string}): Promise<Profile>
	setProfile(options: {accessToken: AccessToken; profile: Profile}): Promise<void>
}

export interface ClaimsVanguardTopic extends Topic<ClaimsVanguardTopic> {
	createUser(o: {googleId: string}): Promise<User>
	setClaims(o: {userId: string; claims: Claims}): Promise<User>
}

export interface ClaimsDealerTopic extends Topic<ClaimsDealerTopic> {
	getUser(o: {userId: string}): Promise<User>
}

export interface PaywallGuardianTopic
 extends Topic<PaywallGuardianTopic> {
	grantUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>

	revokeUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>
}

export interface VimeoGovernorTopic
 extends Topic<VimeoGovernorTopic> {
	getVimeo(o: {
		accessToken: AccessToken
		videoName: string
	}): Promise<{vimeoId: string}>

	setVimeo(o: {
		accessToken: AccessToken
		videoName: string
		vimeoId: string
	}): Promise<void>
}
