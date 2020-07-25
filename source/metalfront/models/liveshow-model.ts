
import {observable, action, runInAction} from "mobx"

import * as evaluators from "../../business/core/user-evaluators.js"

import {pubsub} from "../../toolbox/pubsub.js"
import * as loading from "../toolbox/loading.js"

import {LiveshowLizardTopic, MetalUser, AccessToken} from "../../types.js"
import {AuthPayload, PrivilegeLevel, GetAuthContext, VideoPayload} from "../types.js"

export type HandleAuthUpdate = (auth: loading.Load<AuthPayload<MetalUser>>) => Promise<void>

export class LiveshowModel {
	private liveshowLizard: LiveshowLizardTopic

	constructor(options: {
			liveshowLizard: LiveshowLizardTopic
		}) {
		this.liveshowLizard = options.liveshowLizard
	}

	//
	// pubsub to mirror auth load to view models
	//

	authLoadPubsub = pubsub<HandleAuthUpdate>()

	handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		this.authLoadPubsub.publish(authLoad)
	}

	dispose() {
		this.authLoadPubsub.dispose()
	}

	//
	// function to create new view models
	//

	makeViewModel = ({label}: {label: string}): {
			dispose: () => void,
			viewModel: LiveshowViewModel,
		} => {
		const {liveshowLizard} = this
		const viewModel = new LiveshowViewModel({
			label,
			liveshowLizard,
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
export class LiveshowViewModel {

	//
	// public observables
	//

	@observable validationMessage: string = null
	@observable videoLoad = loading.load<VideoPayload>()
	@observable privilege: PrivilegeLevel = PrivilegeLevel.Unknown

	//
	// private variables and constructor
	//

	private label: string
	private getAuthContext: GetAuthContext<MetalUser>
	private liveshowLizard: LiveshowLizardTopic

	constructor(options: {
			label: string
			liveshowLizard: LiveshowLizardTopic
		}) {
		Object.assign(this, options)
	}

	//
	// public actions
	//

	 @action.bound
	ascertainPrivilege(user: MetalUser): PrivilegeLevel {
		return evaluators.isPremium(user)
			? PrivilegeLevel.Privileged
			: PrivilegeLevel.Unprivileged
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {

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
			const {label, getAuthContext} = this
			const {accessToken} = await getAuthContext()
			await this.liveshowLizard.setShow({
				vimeoId,
				accessToken,
				label,
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
		return await this.liveshowLizard.getShow({
			accessToken,
			label: this.label,
		})
	}
}
