
import {observable, action} from "mobx"
import * as loading from "../toolbox/loading.js"
import {GetAuthContext, AuthPayload} from "../types.js"
import {User, ScheduleSentryTopic, ScheduleEvent} from "../../types.js"

export class ScheduleModel {
	private getAuthContext: GetAuthContext<User>
	private scheduleSentry: ScheduleSentryTopic

	@observable events: ScheduleEvent[] = []

	constructor(options: {scheduleSentry: ScheduleSentryTopic}) {
		Object.assign(this, options)
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<User>>) {
		this.getAuthContext = loading.payload(authLoad)?.getAuthContext
	}

	 @action.bound
	async loadEvent(label: string): Promise<ScheduleEvent> {
		let event = this.events.find(e => e.label === event.name)
		if (!event) {
			event = await this.scheduleSentry.getEvent({label})
			this.saveToCache(event)
		}
		return event
	}

	 @action.bound
	async saveEvent(event: ScheduleEvent): Promise<void> {
		const {accessToken} = await this.getAuthContext()
		await this.scheduleSentry.setEvent({accessToken, event})
		this.saveToCache(event)
	}

	 @action.bound
	private saveToCache(event: ScheduleEvent) {
		const existing = this.events.find(e => e.label === event.label)
		if (existing) existing.time = event.time
		else this.events.push(event)
	}
}
