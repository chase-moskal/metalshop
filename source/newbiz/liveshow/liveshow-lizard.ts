
import {
	User,
	VerifyToken,
	LiveshowRow,
	AccessPayload,
	LiveshowAuthorizers,
	LiveshowLizardTopic,
} from "../../types.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"
import {makeLiveshowAuthorizers} from "./liveshow-authorizers.js"

export function makeLiveshowLizard({
		verifyToken,
		liveshowTable,
		authorizers = makeLiveshowAuthorizers(),
	}: {
		verifyToken: VerifyToken
		liveshowTable: DbbyTable<LiveshowRow>
		authorizers?: LiveshowAuthorizers<User>
	}): LiveshowLizardTopic {
	return {

		async getShow({accessToken, label}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!authorizers.authorizeAccess(user)) throw new Error("not authorized")
			const record = await liveshowTable.one({
				conditions: {equal: {label}}
			})
			return record ? {vimeoId: record.vimeoId} : null
		},

		async setShow({accessToken, label, vimeoId}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!authorizers.authorizeControl(user)) throw new Error("not authorized")
			await liveshowTable.update({
				conditions: {equal: {label}},
				upsert: {label, vimeoId},
			})
		},
	}
}
