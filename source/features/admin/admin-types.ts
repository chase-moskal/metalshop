
import {AccessToken} from "../../types.js"
import {DbbyRow} from "../../toolbox/dbby/dbby-types.js"
import * as loading from "../../metalfront/toolbox/loading.js"
import {AccessPayload, Personal} from "../../metalfront/types.js"

import {makeAdminApi} from "./admin-api.js"

//
// universal
//

export interface AppPayload {
	appId: string
	origins: string[]
	created: number
	expiry: number
}

export interface AuthMeta {
	appToken: string
	accessToken: AccessToken
}

export interface AuthData {
	app: AppPayload
	access: AccessPayload
}

export type Authorizer = (meta: AuthMeta) => Promise<AuthData>

//
// admin-specific
//

export type AdminApi = ReturnType<typeof makeAdminApi>

// export interface AdminPermissionsTopic extends Topic {
// 	list(o: {accessToken: AccessToken}): Promise<Role[]>
// 	setRole(o: {
// 			accessToken: AccessToken
// 			role: Role
// 		}): Promise<void>
// }

// export interface AdminApi extends Api {
// 	permissions: AdminPermissionsTopic
// }

export interface RoleRow extends DbbyRow {
	label: string
	permissions: string
}

export interface Role {
	label: string
	permissions: string[]
}

export interface AdminShare {
	personalLoad: loading.Load<Personal>
}
