
import {User} from "./common.js"
import {DbbyValue} from "../toolbox/dbby/types.js"

export type AccessToken = string
export type RefreshToken = string

export interface Scope {
	[key: string]: DbbyValue
	core: boolean
}

export interface AuthTokens {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

export interface AccessPayload<S extends Scope = Scope> {
	user: User
	scope: S
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

export type VerifyRefreshToken = (refreshToken: RefreshToken) => Promise<RefreshPayload>
export type VerifyAccessToken = <S extends Scope = Scope>(accessToken: AccessToken) => Promise<AccessPayload<S>>
