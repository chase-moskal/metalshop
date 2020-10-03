
import {AccessToken, AccessPayload} from "./tokens.js"
import {DbbyRow, DbbyTable} from "../toolbox/dbby/dbby-types.js"

export interface AppPayload {
	appId: string
	origins: string[]
	created: number
	expiry: number
	root: boolean
}

export interface AuthMeta {
	appToken: string
	accessToken: AccessToken
}

export interface AuthData {
	app: AppPayload
	access: AccessPayload
}

export type TopicAuthorizer = (meta: AuthMeta) => Promise<AuthData>

export type GetAppTable = <Row extends DbbyRow>(appId: string) => DbbyTable<Row>
