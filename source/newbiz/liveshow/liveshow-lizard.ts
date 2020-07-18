
import {
	User,
	Authorizer,
	LiveshowRow,
	LiveshowLizardTopic,
} from "../../types.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"

export function makeLiveshowLizard<U extends User = User>({
		liveshowTable,
		authorize,
		userCanRead,
		userCanWrite,
	}: {
		liveshowTable: DbbyTable<LiveshowRow>
		authorize: Authorizer<U>
		userCanRead: (user: U) => boolean
		userCanWrite: (user: U) => boolean
	}): LiveshowLizardTopic {
	return {

		async getShow({accessToken, label}) {
			const user = await authorize(accessToken)
			const allowed = userCanRead(user)
			if (!allowed) throw new Error("not allowed")

			const record = await liveshowTable.one({
				conditions: {equal: {label}}
			})
			return record ? {vimeoId: record.vimeoId} : undefined
		},

		async setShow({accessToken, label, vimeoId}) {
			const user = await authorize(accessToken)
			const allowed = userCanWrite(user)
			if (!allowed) throw new Error("not allowed")

			await liveshowTable.update({
				conditions: {equal: {label}},
				upsert: {label, vimeoId},
			})
		},
	}
}
