
import {User} from "../types.js"
import {DbbyValue} from "../toolbox/dbby/types.js"

export * from "redcrypto/dist/types.js"

export type AccessToken = string
export type RefreshToken = string

export interface Scope {
	[key: string]: DbbyValue
}

export interface MetalScope extends Scope {
	core: boolean
}

export interface AuthTokens {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

export interface AccessPayload<S extends Scope = Scope, U extends User = User> {
	scope: S
	user: U
}

export interface RefreshPayload {
	userId: string
}

export interface TokenData<Payload = any> {
	iat: any
	exp: any
	payload: Payload
}

export type VerifyRefreshToken = (
	refreshToken: RefreshToken
) => Promise<RefreshPayload>

export type VerifyAccessToken = <S extends Scope = Scope>(
	accessToken: AccessToken
) => Promise<AccessPayload<S>>

export type Authorizer<U extends User = User> = (
	accessToken: AccessToken
) => Promise<U>
