
import {topicTransform} from "renraku/dist/curries.js"
import {DbbyRow, DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {AuthMeta, Authorizer, Role, RoleRow, GetAppTable} from "./admin-types.js"

export function makeAdminApi({auth, getAppTable}: {
		auth: Authorizer
		getAppTable: GetAppTable // <R extends DbbyRow>(appId: string) => DbbyTable<R>
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
