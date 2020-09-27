
import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {User, Authorizer, LiveshowRow, LiveshowLizardTopic} from "../../types.js"

export function makeLiveshowLizard({
		liveshowTable,
		authorize,
		userCanRead,
		userCanWrite,
	}: {
		liveshowTable: DbbyTable<LiveshowRow>
		authorize: Authorizer
		userCanRead: (user: User) => boolean
		userCanWrite: (user: User) => boolean
	}): LiveshowLizardTopic {
	return {

		async getShow({accessToken, label}) {
			const user = await authorize(accessToken)
			const allowed = userCanRead(user)
			if (!allowed) throw new Error("not allowed")

			const record = await liveshowTable.one({
				conditions: and({equal: {label}}),
			})
			return record ? {vimeoId: record.vimeoId} : undefined
		},

		async setShow({accessToken, label, vimeoId}) {
			const user = await authorize(accessToken)
			const allowed = userCanWrite(user)
			if (!allowed) throw new Error("not allowed")

			await liveshowTable.update({
				conditions: and({equal: {label}}),
				upsert: {label, vimeoId},
			})
		},
	}
}
