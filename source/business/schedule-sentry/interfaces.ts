
import {AccessToken} from "../../interfaces/tokens.js"

export interface ScheduleEvent {
	time: number
}

export interface ScheduleSentryTopic {
	getEvent(options: {
		name: string
	}): Promise<ScheduleEvent>
	setEvent(options: {
		name: string
		event: ScheduleEvent
		accessToken: AccessToken
	}): Promise<void>
}

export interface ScheduleDatalayer {
	getEvent(name: string): Promise<ScheduleEvent>
	setEvent(name: string, event: ScheduleEvent): Promise<void>
}
