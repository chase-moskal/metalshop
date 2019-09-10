
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

export interface AuthExchangerApi extends renraku.Api<AuthExchangerApi> {
	authExchanger: AuthExchangerTopic
}

export interface User {
	userId: number
	claims: {[key: string]: any}
}
