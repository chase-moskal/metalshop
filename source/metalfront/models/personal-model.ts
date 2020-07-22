
import {observable, action, computed} from "mobx"

import * as loading from "../toolbox/loading.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {makeTicketbooth} from "../toolbox/ticketbooth.js"

import {Personal, GetAuthContext, AuthPayload} from "../types.js"
import {MetalUser, MetalProfile, MetalSettings, SettingsSheriffTopic, UserUmbrellaTopic} from "../../types.js"

export class PersonalModel {
	@observable personalLoad = loading.load<Personal>()

	@computed get personal() {
		return loading.payload(this.personalLoad)
	}

	@computed get user() {
		return this.personal?.user
	}

	@computed get settings() {
		return this.personal?.settings
	}

	private logger: Logger
	private ticketbooth = makeTicketbooth()
	private getAuthContext: GetAuthContext<MetalUser>
	private userUmbrella: UserUmbrellaTopic<MetalUser>
	private settingsSheriff: SettingsSheriffTopic<MetalSettings>

	constructor({
			logger,
			userUmbrella,
			settingsSheriff,
		}: {
			logger: Logger
			userUmbrella: UserUmbrellaTopic<MetalUser>
			settingsSheriff: SettingsSheriffTopic<MetalSettings>
		}) {
		this.logger = logger
		this.userUmbrella = userUmbrella
		this.settingsSheriff = settingsSheriff
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		const authPayload = loading.payload(authLoad)
		const loggedIn = !!authPayload?.user
		this.getAuthContext = authPayload?.getAuthContext || undefined

		if (loggedIn) {
			try {
				this.setPersonalLoad(loading.loading())
				const {user, accessToken} = await this.getAuthContext()
				const {userId} = user
				const sessionStillValid = this.ticketbooth.pullSession()
				const settings = await this.settingsSheriff.fetchSettings({accessToken})
				if (sessionStillValid()) {
					this.setPersonalLoad(loading.ready({user, settings}))
					this.logger.debug("personal details loaded")
				}
				else this.logger.debug("personal details discarded")
			}
			catch (error) {
				this.setPersonalLoad(loading.error("error loading personal data"))
				console.error(error)
			}
		}
	}

	 @action.bound
	async saveProfile(profile: MetalProfile): Promise<void> {
		if (!this.personal) throw new Error("personal not loaded")
		const {accessToken} = await this.getAuthContext()
		const {user, settings} = this.personal
		const {userId} = user
		await this.userUmbrella.setProfile({accessToken, profile, userId})
		this.setPersonalLoad(loading.ready({user, settings}))
	}

	 @action.bound
	async setAdminMode(adminMode: boolean): Promise<void> {
		if (!this.personal) throw new Error("personal not loaded")
		const {accessToken} = await this.getAuthContext()
		const settings = await this.settingsSheriff.setActAsAdmin({
			accessToken,
			actAsAdmin: adminMode,
		})
		const {user} = this.personal
		this.setPersonalLoad(loading.ready({user, settings}))
	}

	// TODO implement avatar publicity

	//  @action.bound
	// async setAvatarPublicity(avatarPublicity: boolean): Promise<void> {
	// 	if (!this.personal) throw new Error("personal not loaded")
	// 	const {user, accessToken} = await this.getAuthContext()
	// 	const {settings, profile} = await this.settingsSheriff.setAvatarPublicity({
	// 		accessToken,
	// 		avatarPublicity,
	// 	})
	// 	this.setPersonalLoad(loading.ready({user, profile, settings}))
	// }

	 @action.bound
	private setPersonalLoad(personalLoad: loading.Load<Personal>) {
		this.personalLoad = personalLoad
	}
}
