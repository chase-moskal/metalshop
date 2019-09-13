
import {Topic, Api} from "renraku/dist/interfaces.js"

export type AccessToken = string
export type RefreshToken = string

export interface AccessData {
	name: string
	profilePicture: string
}

export interface AuthTokens {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

export interface Claims {
	[key: string]: any
}

export interface User {
	userId: number
	claims: Claims
}

export interface Profile {
	userId: string
	picture: string
	realname: string
	nickname: string
}

export interface AuthExchangerTopic extends Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export interface TokenStorageTopic extends Topic<TokenStorageTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
}

export interface AccountPopupTopic extends Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}

export interface ProfilerTopic extends Topic<ProfilerTopic> {
	getProfile(options: {accessToken: AccessToken; userId: string}): Promise<Profile>
	setProfile(options: {accessToken: AccessToken; profile: Profile}): Promise<void>
}

export interface ProfilerCacheTopic extends Topic<ProfilerCacheTopic> {
	getProfile(options: {accessToken: AccessToken; userId: string}): Promise<Profile>
	setProfile(options: {accessToken: AccessToken; profile: Profile}): Promise<void>
}

export interface ClaimsVanguardTopic extends Topic<ClaimsVanguardTopic> {
	createUser(options: {googleId: User}): Promise<User>
	getUser(options: {userId: string}): Promise<User>
	setClaims(options: {userId: string; claims: Claims}): Promise<User>
}

export interface PaywallGuardianTopic extends Topic<PaywallGuardianTopic> {
	makeUserPremium({accessToken: AccessToken}): Promise<AccessToken>
	revokeUserPremium({accessToken: AccessToken}): Promise<AccessToken>
}

export interface AuthExchangerApi extends Api<AuthExchangerApi> {
	authExchanger: AuthExchangerTopic
}

export interface ProfilerApi extends Api<ProfilerApi> {
	profiler: ProfilerTopic
}

export interface ClaimsVanguardApi extends Api<ClaimsVanguardApi> {
	claimsVanguard: ClaimsVanguardTopic
}

export interface PaywallGuardianApi extends Api<PaywallGuardianApi> {
	paywallGuardian: PaywallGuardianTopic
}
