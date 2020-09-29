
import {Api, Topic} from "renraku/dist/interfaces.js"

import {Role, RoleRow} from "./admin-types.js"
import {AccessToken, VerifyAccessToken} from "../../types.js"

import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"

export function makeAdminApi({
		roleTable,
		verifyAccessToken,
	}: {
		roleTable: DbbyTable<RoleRow>
		verifyAccessToken: VerifyAccessToken
	}) {
	return {
		permissions: {
			async list({accessToken}: {accessToken: AccessToken}) {
				const {user, scope} = await verifyAccessToken(accessToken)
				return []
			},
			async setRole({accessToken, role}: {
					role: Role
					accessToken: AccessToken
				}) {
				const {user, scope} = await verifyAccessToken(accessToken)
				return
			},
		}
	}
}
