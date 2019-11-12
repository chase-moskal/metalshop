
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

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

export type PaypalToken = string

//
// RENRAKU APIs
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	claimsDealer: ClaimsDealerTopic
	authExchanger: AuthExchangerTopic
	claimsVanguard: ClaimsVanguardTopic
}

export interface ProfileApi extends RenrakuApi<ProfileApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallGuardian: PaywallGuardianTopic
}

export interface PrivateVimeoApi extends RenrakuApi<PrivateVimeoApi> {
	vimeoGovernor: PrivateVimeoGovernorTopic
}

//
// CROSSCALL APIs
//

export interface TokenStorageApi extends CrosscallApi<TokenStorageApi> {
	tokenStorage: TokenStorageTopic
}

export interface ProfileMagistrateCacheApi
 extends CrosscallApi<ProfileMagistrateCacheApi>{
	profileMagistrateCache: ProfileMagistrateTopic
}

export interface AccountPopupApi extends CrosscallApi<AccountPopupApi> {
	accountPopup: AccountPopupTopic
}

//
// API METHODS
//

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
	getPublicProfile(options: {userId: string}): Promise<Profile>
	getFullProfile(options: {accessToken: AccessToken}): Promise<Profile>
	setFullProfile(options: {accessToken: AccessToken; profile: Profile}):
		Promise<void>
}

export interface ClaimsVanguardTopic extends Topic<ClaimsVanguardTopic> {
	createUser(o: {googleId: string}): Promise<User>
	getUser(o: {userId: string}): Promise<User>
	setClaims(o: {
		userId: string
		publicClaims?: Claims
		privateClaims?: Claims
	}): Promise<User>
}

export interface ClaimsDealerTopic
 extends Topic<ClaimsDealerTopic> {
	getPublicUser(options: {userId: string}): Promise<User>
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
