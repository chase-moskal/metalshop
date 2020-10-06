
import {topicTransform} from "renraku/dist/curries.js"

import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {GetDbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {User, TopicAuthorizer, AuthMeta} from "../../types.js"

import {LiveshowRow} from "./liveshow-types.js"

export function makeLiveshowApi({auth, getDbbyTable, userCanRead, userCanWrite}: {
		auth: TopicAuthorizer
		getDbbyTable: GetDbbyTable
		userCanRead: (user: User) => boolean
		userCanWrite: (user: User) => boolean
	}) {

	async function authorizer(meta: AuthMeta) {
		const {app, access} = await auth(meta)
		return {
			allowRead: userCanRead(access.user),
			allowWrite: userCanWrite(access.user),
			liveshowTable: getDbbyTable<LiveshowRow>(`liveshows-${app.appId}`),
		}
	}

	return {
		liveshowTopic: topicTransform(authorizer, {

			async getShow({liveshowTable, allowRead}, {label}: {label: string}) {
				if (allowRead) {
					const row = await liveshowTable.one({
						conditions: and({equal: {label}})
					})
					return row
						? {vimeoId: row.vimeoId}
						: undefined
				}
				else throw new Error("user not allowed liveshow read")
			},

			async setShow({liveshowTable, allowWrite}, {label, vimeoId}: {
					label: string
					vimeoId: string
				}) {
				if (allowWrite) {
					await liveshowTable.update({
						conditions: and({equal: {label}}),
						upsert: {label, vimeoId},
					})
				}
				else throw new Error("user not allowed liveshow write")
			},
		})
	}
}
