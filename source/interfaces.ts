
import {Topic, Api} from "renraku/dist/interfaces.js"

export type AccessToken = string
export type RefreshToken = string

export interface AuthTokens {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

export interface AccessPayload {
	user: User
}

export interface RefreshPayload {
	userId: string
}

export interface TokenData<Payload = any> {
	iat: any
	exp: any
	payload: Payload
}

export interface Claims {
	[key: string]: any
}

export interface User {
	userId: string
	public: {
		claims: Claims
	}
	private?: {
		claims: Claims
	}
}

export interface Profile {
	userId: string
	public: {
		picture: string
		nickname: string
	}
	private?: {
		realname: string
	}
}

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

export interface ProfileMagistrateTopic extends Topic<ProfileMagistrateTopic> {
	getPublicProfile(options: {userId: string}): Promise<Profile>
	getFullProfile(options: {accessToken: AccessToken}): Promise<Profile>
	setFullProfile(options: {accessToken: AccessToken; profile: Profile}):
		Promise<void>
}

export interface ClaimsVanguardTopic extends Topic<ClaimsVanguardTopic> {
	createUser(options: {googleId: string}): Promise<User>
	getUser(options: {userId: string}): Promise<User>
	setPublicClaims(options: {userId: string; claims: Claims}): Promise<User>
	setPrivateClaims(options: {userId: string; claims: Claims}): Promise<User>
}

export interface PublicClaimsDealerTopic
 extends Topic<PublicClaimsDealerTopic> {
	getPublicUser(options: {userId: string}): Promise<User>
}

export type PaypalToken = string

export interface PaywallGuardianTopic extends Topic<PaywallGuardianTopic> {

	grantUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>

	revokeUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>
}

export interface PrivateVimeoGovernorTopic
 extends Topic<PrivateVimeoGovernorTopic> {

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

export interface AuthExchangerApi extends Api<AuthExchangerApi> {
	authExchanger: AuthExchangerTopic
}

export interface ProfileMagistrateApi extends Api<ProfileMagistrateApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface ClaimsVanguardApi extends Api<ClaimsVanguardApi> {
	claimsVanguard: ClaimsVanguardTopic
}

export interface PaywallGuardianApi extends Api<PaywallGuardianApi> {
	paywallGuardian: PaywallGuardianTopic
}

export interface PrivateVimeoGovernorApi
 extends Topic<PrivateVimeoGovernorTopic> {
	privateVimeoGovernor: PrivateVimeoGovernorTopic
}
