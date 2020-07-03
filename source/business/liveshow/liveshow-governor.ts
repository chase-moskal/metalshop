
import {
	VerifyToken,
	LiveshowTable,
	AccessPayload,
	LiveshowAuthorizers,
	LiveshowGovernorTopic,
} from "../../interfaces.js"

import {makeLiveshowAuthorizers} from "./liveshow-authorizers.js"

export function makeLiveshowGovernor({
		verifyToken,
		liveshowTable,
		authorizers = makeLiveshowAuthorizers(),
	}: {
		verifyToken: VerifyToken
		liveshowTable: LiveshowTable
		authorizers?: LiveshowAuthorizers
	}): LiveshowGovernorTopic {

	const {authorizeControl, authorizeAccess} = authorizers
	return {

		async getShow({accessToken, videoName}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!authorizeAccess(user)) throw new Error("not authorized")

			const record = await liveshowTable.one({
				conditions: {equal: {videoName}}
			})
			return {vimeoId: record.vimeoId}
		},

		async setShow({accessToken, videoName, vimeoId}) {
			const {user} = await verifyToken<AccessPayload>(accessToken)
			if (!authorizeControl(user)) throw new Error("not authorized")

			await liveshowTable.update({
				conditions: {equal: {videoName}},
				upsert: {videoName, vimeoId},
			})
		},
	}
}
