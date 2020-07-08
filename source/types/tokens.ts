
import {User} from "./common.js"

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

export type SignToken = <Payload extends {}>(
	payload: Payload,
	expiresMilliseconds: number
) => Promise<string>

export type VerifyToken = <Payload extends {}>(
	token: string
) => Promise<Payload>

export type VerifyAccessToken = (accessToken: AccessToken) => Promise<AccessPayload>
export type VerifyRefreshToken = (refreshToken: RefreshToken) => Promise<RefreshPayload>
