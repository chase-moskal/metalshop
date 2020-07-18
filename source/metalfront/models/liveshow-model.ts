
import {observable, action, runInAction} from "mobx"

import {pubsub} from "../../toolbox/pubsub.js"
import * as loading from "../toolbox/loading.js"

import {LiveshowLizardTopic, User, AccessToken} from "../../types.js"
import {AuthPayload, PrivilegeLevel, GetAuthContext, VideoPayload} from "../types.js"

export type HandleAuthUpdate<U extends User> = (auth: loading.Load<AuthPayload<U>>) => Promise<void>

export class LiveshowModel<U extends User> {
	private liveshowGovernor: LiveshowLizardTopic
	constructor(options: {
			liveshowGovernor: LiveshowLizardTopic
		}) {
		Object.assign(this, options)
	}

	//
	// pubsub to mirror auth load to view models
	//

	authLoadPubsub = pubsub<HandleAuthUpdate<U>>()

	handleAuthLoad(authLoad: loading.Load<AuthPayload<U>>) {
		this.authLoadPubsub.publish(authLoad)
	}

	dispose() {
		this.authLoadPubsub.dispose()
	}

	//
	// function to create new view models
	//

	makeViewModel = ({videoLabel}: {videoLabel: string}): {
			dispose: () => void,
			viewModel: LiveshowViewModel<U>,
		} => {
		const {liveshowGovernor} = this
		const viewModel = new LiveshowViewModel<U>({
			videoLabel,
			liveshowGovernor,
		})
		const dispose = this.authLoadPubsub.subscribe(viewModel.handleAuthLoad)
		return {
			dispose,
			viewModel,
		}
	}
}

/**
 * Component-level liveshow state
 */
export class LiveshowViewModel<U extends User> {

	//
	// public observables
	//

	@observable validationMessage: string = null
	@observable videoLoad = loading.load<VideoPayload>()
	@observable privilege: PrivilegeLevel = PrivilegeLevel.Unknown

	//
	// private variables and constructor
	//

	private videoLabel: string
	private getAuthContext: GetAuthContext<U>
	private liveshowGovernor: LiveshowLizardTopic

	constructor(options: {
			videoLabel: string
			liveshowGovernor: LiveshowLizardTopic
		}) {
		Object.assign(this, options)
	}

	//
	// public actions
	//

	 @action.bound
	ascertainPrivilege(user: User): PrivilegeLevel {
		return user.claims.admin
			? PrivilegeLevel.Privileged
			: user.claims.premium
				? PrivilegeLevel.Privileged
				: PrivilegeLevel.Unprivileged
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<U>>) {

		// initialize observables
		this.videoLoad = loading.none()
		this.privilege = <PrivilegeLevel>PrivilegeLevel.Unknown

		// setup variables
		this.getAuthContext = null
		const authIsReady: boolean = loading.isReady(authLoad)
		const getAuthContext = loading.payload(authLoad)?.getAuthContext
		const userIsLoggedIn = !!getAuthContext

		// logic for privileges and loading the video
		if (authIsReady) {
			if (userIsLoggedIn) {
				this.getAuthContext = getAuthContext
				const {user, accessToken} = await getAuthContext()

				// set privilege level
				const privilege = this.ascertainPrivilege(user)
				runInAction(() => this.privilege = privilege)

				// load video
				if (privilege === PrivilegeLevel.Privileged) {
					runInAction(() => this.videoLoad = loading.loading())
					const {vimeoId} = (await this.loadVideo(accessToken)) || {}
					runInAction(() => this.videoLoad = loading.ready({
						vimeoId
					}))
				}
			}
			else this.privilege = PrivilegeLevel.Unprivileged
		}
	}

	 @action.bound
	async updateVideo(vimeostring: string) {
		vimeostring = vimeostring.trim()
		this.validationMessage = null

		let vimeoId: string
		{
			const idParse = /^\d{5,}$/i.exec(vimeostring)
			const linkParse = /vimeo\.com\/(\d{5,})/i.exec(vimeostring)
			if (idParse) {
				vimeoId = vimeostring
			}
			else if (linkParse) {
				vimeoId = linkParse[1]
			}
		}

		if (vimeoId || vimeostring === "") {
			const {videoLabel, getAuthContext} = this
			const {accessToken} = await getAuthContext()
			await this.liveshowGovernor.setShow({
				vimeoId,
				accessToken,
				label: videoLabel,
			})
		}
		else {
			this.validationMessage = "invalid vimeo link or id"
		}
	}

	//
	// private functionality
	//

	 @action.bound
	private async loadVideo(accessToken: AccessToken) {
		return await this.liveshowGovernor.getShow({
			accessToken,
			label: this.videoLabel,
		})
	}
}
