
import {observable, action} from "mobx"
import * as loading from "../toolbox/loading.js"
import {GetAuthContext, AuthPayload} from "../interfaces.js"
import {ScheduleSentryTopic, ScheduleEvent} from "../../interfaces.js"

export class ScheduleModel {
	@observable events: ScheduleEvent[] = []
	private getAuthContext: GetAuthContext
	private scheduleSentry: ScheduleSentryTopic

	constructor(options: {scheduleSentry: ScheduleSentryTopic}) {
		Object.assign(this, options)
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload>) {
		this.getAuthContext = loading.payload(authLoad)?.getAuthContext
	}

	 @action.bound
	async loadEvent(name: string): Promise<ScheduleEvent> {
		let event = this.events.find(e => e.name === event.name)
		if (!event) {
			event = await this.scheduleSentry.getEvent({name})
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
		const existing = this.events.find(e => e.name === event.name)
		if (existing) existing.time = event.time
		else this.events.push(event)
	}
}
