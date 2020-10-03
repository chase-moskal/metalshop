
import {topicTransform} from "renraku/dist/curries.js"
import {AuthMeta, Authorizer, Role, RoleRow, GetAppTable} from "./admin-types.js"

export function makeAdminApi({auth, getAppTable}: {
		auth: Authorizer
		getAppTable: GetAppTable
	}) {

	async function authorizer(meta: AuthMeta) {
		const payload = await auth(meta)
		return {
			...payload,
			roleTable: getAppTable<RoleRow>(payload.app.appId),
		}
	}

	return {
		permissions: topicTransform(authorizer, {
			async list({roleTable}) {
				return []
			},
			async setRole(payload, {role}: {role: Role}) {
				return
			},
		})
	}
}
