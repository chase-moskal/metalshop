
import {User, VerifyToken, AccessPayload, ScheduleSentryTopic, ScheduleTable} from "../../interfaces.js"

const authorizeControl = (user: User) => (false
	|| !!user.claims.admin
	|| !!user.claims.staff
)

export const makeScheduleSentry = ({verifyToken, scheduleTable}: {
		verifyToken: VerifyToken
		scheduleTable: ScheduleTable
	}): ScheduleSentryTopic => ({

	async getEvent({name}) {
		return scheduleTable.one({conditions: {equal: {name}}})
	},

	async setEvent({accessToken, event}) {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		if (!authorizeControl(user)) throw new Error("not authorized")

		// TODO validate event

		await scheduleTable.update({
			conditions: {equal: {name}},
			upsert: event,
		})
	},
})
