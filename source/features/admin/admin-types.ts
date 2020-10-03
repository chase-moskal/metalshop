
import {AccessToken} from "../../types.js"
import * as loading from "../../metalfront/toolbox/loading.js"
import {AccessPayload, Personal} from "../../metalfront/types.js"
import {DbbyRow, DbbyTable, AsDbbyRow} from "../../toolbox/dbby/dbby-types.js"

import {makeAdminApi} from "./admin-api.js"

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

export type RoleRow = AsDbbyRow<{
	label: string
	permissions: string
}>

export interface Role {
	label: string
	permissions: string[]
}

export interface AdminShare {
	personalLoad: loading.Load<Personal>
}
