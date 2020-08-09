
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {ScheduleSentryTopic, ScheduleEventRow, Authorizer, User} from "../../types.js"

export function makeScheduleSentry({
		scheduleEventTable,
		authorize,
		userCanChangeSchedule,
	}: {
		authorize: Authorizer
		userCanChangeSchedule: (user: User) => boolean
		scheduleEventTable: DbbyTable<ScheduleEventRow>
	}): ScheduleSentryTopic {

	return {

		async getEvent({label}) {
			const row = await scheduleEventTable.one({
				conditions: {equal: {label}}
			})
			return row && {
				label,
				time: row.time,
			}
		},

		async setEvent({event, accessToken}) {
			const user = await authorize(accessToken)
			const allowed = userCanChangeSchedule(user)
			if (!allowed) throw new Error("not allowed")
			await scheduleEventTable.update({
				conditions: {equal: {label: event.label}},
				upsert: {
					label: event.label,
					time: event.time,
				}
			})
		},
	}
}
