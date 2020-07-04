
import {AccessToken, ScheduleEvent} from "../../interfaces.js"

export interface ScheduleSentryTopic {
	getEvent(options: {
			name: string
		}): Promise<ScheduleEvent>
	setEvent(options: {
			event: ScheduleEvent
			accessToken: AccessToken
		}): Promise<void>
}
