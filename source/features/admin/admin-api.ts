
import {processPayloadTopic} from "renraku/dist/curries.js"
import {Role, RoleRow} from "./admin-types.js"

import {AuthMeta, TopicAuthorizer, GetAppTable} from "../../types.js"

export function makeAdminApi({auth, getAppTable}: {
		auth: TopicAuthorizer
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
		permissions: processPayloadTopic(authorizer, {
			async list(payload, {roleTable}) {
				return []
			},
			async setRole(payload, {role}: {role: Role}) {
				return
			},
		})
	}
}
