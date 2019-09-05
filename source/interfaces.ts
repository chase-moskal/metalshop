
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

export interface AuthTopic extends renraku.Topic<AuthTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateWithGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export interface TokenTopic extends renraku.Topic<TokenTopic> {
	logout(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
}

export interface LoginTopic extends renraku.Topic<LoginTopic> {
	userLoginRoutine(): Promise<AccessToken>
}
