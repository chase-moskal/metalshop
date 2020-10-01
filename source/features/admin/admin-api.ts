
import {topicTransform} from "renraku/dist/curries.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {Authorizer, Role, RoleRow} from "./admin-types.js"

export function makeAdminApi({auth, roleTable}: {
		auth: Authorizer
		roleTable: DbbyTable<RoleRow>
	}) {
	return {
		permissions: topicTransform(auth, {
			async list(payload) {
				return []
			},
			async setRole(payload, {role}: {role: Role}) {
				return
			},
		})
	}
}
