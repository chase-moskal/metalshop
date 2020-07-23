
import {observable, action, computed} from "mobx"

import {GetAuthContext, AuthPayload} from "../types.js"
import {MetalUser, MetalSettings, SettingsSheriffTopic} from "../../types.js"

import * as loading from "../toolbox/loading.js"
import {makeTicketbooth} from "../toolbox/ticketbooth.js"
import {Logger} from "../../toolbox/logger/interfaces.js"

export class SettingsModel {
	private logger: Logger
	private settingsSheriff: SettingsSheriffTopic<MetalSettings>
	private ticketbooth = makeTicketbooth()
	private getAuthContext: GetAuthContext<MetalUser> = null

	@observable settingsLoad = loading.load<MetalSettings>()
	@computed get settings() { return loading.payload(this.settingsLoad) }

	constructor({logger, settingsSheriff}: {
			logger: Logger
			settingsSheriff: SettingsSheriffTopic<MetalSettings>
		}) {
		this.logger = logger
		this.settingsSheriff = settingsSheriff
	}

	 @action.bound
	async setAdminMode(adminMode: boolean) {
		try {
			this.setSettingsLoad(loading.loading())
			const {accessToken} = await this.getAuthContext()
			const settings = await this.settingsSheriff.setActAsAdmin({
				actAsAdmin: adminMode,
				accessToken,
			})
			this.setSettingsLoad(loading.ready(settings))
		}
		catch (error) {
			this.setSettingsLoad(loading.error())
			this.logger.error(error)
		}
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		const authPayload = loading.payload(authLoad)
		this.getAuthContext = authPayload?.getAuthContext || null
		const loggedIn = !!authPayload?.user
		if (loggedIn) {
			try {
				this.setSettingsLoad(loading.loading())
				const {accessToken} = await this.getAuthContext()
				const sessionStillValid = this.ticketbooth.pullSession()
				const settings = await this.settingsSheriff.fetchSettings({accessToken})
				if (sessionStillValid()) {
					this.setSettingsLoad(loading.ready(settings))
					this.logger.debug("settings loaded")
				}
			}
			catch (error) {
				this.setSettingsLoad(loading.error())
				this.logger.error(error)
			}
		}
		else {
			this.setSettingsLoad(loading.none())
		}
	}

	 @action.bound
	private setSettingsLoad(load: loading.Load<MetalSettings>) {
		this.settingsLoad = load
	}
}
