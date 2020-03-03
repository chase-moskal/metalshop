
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
	claims: Claims
}

export interface Profile {
	userId: string
	avatar: string
	nickname: string
}

export type PaypalToken = string

//
// COMMON CONFIG
//

export interface JsonRegex {
	pattern: string
	flags: string
}

export interface CorsConfig {
	allowed: JsonRegex
	forbidden?: JsonRegex
}

export {CorsPermissions} from "renraku/dist/interfaces.js"

//
// ACCOUNT POPUP
//

export enum AccountPopupMessageFlag {
	ReadyResponse,
	GoRequest,
	ResultResponse
}

export interface AccountPopupMessage {
	namespace: string
	flag: AccountPopupMessageFlag
}

export interface AccountPopupReadyResponse extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.ReadyResponse
}

export interface AccountPopupGoRequest extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.GoRequest
}

export interface AccountPopupResultResponse extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.ResultResponse
	tokens: AuthTokens
}

export interface AccountPopupEvent<M extends AccountPopupMessage>
 extends MessageEvent {
	data: M
}

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

export interface VimeoApi extends RenrakuApi<VimeoApi> {
	vimeoGovernor: VimeoGovernorTopic
}

//
// CROSSCALL APIs
//

export interface TokenStorageApi extends CrosscallApi<TokenStorageApi> {
	tokenStorage: TokenStorageTopic
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
