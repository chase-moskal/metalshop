
import * as renraku from "renraku"

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

export interface AuthExchangerTopic extends renraku.Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export interface TokenStorageTopic extends renraku.Topic<TokenStorageTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
}

export interface AccountPopupTopic extends renraku.Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}

export interface ProfilerTopic extends renraku.Topic<ProfilerTopic> {
	getProfile(options: {accessToken: AccessToken; userId: string}): Promise<Profile>
	setProfile(options: {accessToken: AccessToken; profile: Profile}): Promise<void>
}

export interface ProfilerCacheTopic extends renraku.Topic<ProfilerCacheTopic> {
	getProfile(options: {accessToken: AccessToken; userId: string}): Promise<Profile>
	setProfile(options: {accessToken: AccessToken; profile: Profile}): Promise<void>
}

export interface ClaimsVanguardTopic extends renraku.Topic<ClaimsVanguardTopic> {
	createUser(options: {googleId: User}): Promise<User>
	getUser(options: {userId: string}): Promise<User>
	setClaims(options: {userId: string; claims: Claims}): Promise<User>
}

export interface PaywallGuardianTopic extends renraku.Topic<PaywallGuardianTopic> {
	makeUserPremium({accessToken: AccessToken}): Promise<AccessToken>
	revokeUserPremium({accessToken: AccessToken}): Promise<AccessToken>
}

export interface AuthExchangerApi extends renraku.Api<AuthExchangerApi> {
	authExchanger: AuthExchangerTopic
}

export interface ProfilerApi extends renraku.Api<ProfilerApi> {
	profiler: ProfilerTopic
}

export interface ClaimsVanguardApi extends renraku.Api<ClaimsVanguardApi> {
	claimsVanguard: ClaimsVanguardTopic
}

export interface PaywallGuardianApi extends renraku.Api<PaywallGuardianApi> {
	paywallGuardian: PaywallGuardianTopic
}
