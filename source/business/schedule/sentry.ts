
import {VerifyToken, AccessPayload} from "../../interfaces/tokens.js"
import {ScheduleSentryTopic, ScheduleDatalayer} from "./interfaces.js"

export const makeScheduleSentry = ({verifyToken, scheduleDatalayer}: {
		verifyToken: VerifyToken
		scheduleDatalayer: ScheduleDatalayer
	}): ScheduleSentryTopic => ({

	getEvent: async({name}) => scheduleDatalayer.getEvent(name),

	setEvent: async({accessToken, name, event}) => {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		if (!user?.claims?.admin) throw new Error("must be admin to set schedule")
		scheduleDatalayer.setEvent(name, event ? {time: event.time} : undefined)
	}
})
