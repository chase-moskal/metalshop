
import * as renraku from "renraku"

/** Authentication token used to fetch new access tokens */
export type RefreshToken = string

/** Authorization token contains encoded access data */
export type AccessToken = string

/** Access data which is encoded within an access token */
export interface AccessData {
	name: string
	profilePicture: string
}

/** Both auth token types from a successful login routine */
export interface AuthTokens {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

/** Auth server functionality */
export interface AuthTopic extends renraku.Topic {

	/** Trade a refresh token for an access token */
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>

	/** Trade a google token for auth tokens (after the google oauth flow) */
	authenticateWithGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

/** Token crosscall iframe functionality */
export interface TokenTopic extends renraku.Topic {

	/** Check local storage and/or call authorize to obtain an access token */
	obtainAccessToken(): Promise<AccessToken>

	/** Clear all local tokens as a part of a logout routine */
	clearTokens(): Promise<void>
}

/** Login crosscall popup functionality */
export interface LoginTopic extends renraku.Topic {

	/** Initiate the google login routine in a popup, return an access token */
	userLoginRoutine(): Promise<AccessToken>
}
