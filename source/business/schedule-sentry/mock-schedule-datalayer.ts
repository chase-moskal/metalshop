
import {ScheduleDatalayer, ScheduleEvent} from "./interfaces.js"

export function mockScheduleDatalayer(): ScheduleDatalayer {
	const records: {[key: string]: ScheduleEvent} = {}
	return {
		async getEvent(key: string): Promise<ScheduleEvent> {
			return records[key]
		},
		async setEvent(key: string, event: ScheduleEvent): Promise<void> {
			records[key] = event
		},
	}
}
