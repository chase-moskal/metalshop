
import {
	Authorizer,
	LiveshowRow,
	LiveshowLizardTopic,
} from "../../types.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"

export function makeLiveshowLizard({
		liveshowTable,
		authorizeRead,
		authorizeWrite,
	}: {
		authorizeRead: Authorizer
		authorizeWrite: Authorizer
		liveshowTable: DbbyTable<LiveshowRow>
	}): LiveshowLizardTopic {
	return {

		async getShow({accessToken, label}) {
			await authorizeRead(accessToken)
			const record = await liveshowTable.one({
				conditions: {equal: {label}}
			})
			return record ? {vimeoId: record.vimeoId} : undefined
		},

		async setShow({accessToken, label, vimeoId}) {
			await authorizeWrite(accessToken)
			await liveshowTable.update({
				conditions: {equal: {label}},
				upsert: {label, vimeoId},
			})
		},
	}
}
