
import {observable, action, runInAction} from "mobx"
import {curryTopicMeta, CurryTopicMeta} from "renraku/dist/curries.js"

import {MetalUser} from "../../types.js"
import * as loading from "../../metalfront/toolbox/loading.js"
import * as evaluators from "../../business/auth/user-evaluators.js"
import {AuthPayload, GetAuthContext, VideoPayload} from "../../metalfront/types.js"

import {LiveshowTopic, LiveshowPrivilegeLevel} from "./liveshow-types.js"

/**
 * Component-level liveshow state
 */
export class LiveshowViewModel {

	//
	// public observables
	//

	@observable validationMessage: string = null
	@observable videoLoad = loading.load<VideoPayload>()
	@observable privilege: LiveshowPrivilegeLevel = LiveshowPrivilegeLevel.Unknown

	//
	// private variables and constructor
	//

	private label: string
	private getAuthContext: GetAuthContext<MetalUser>
	private liveshowTopic: CurryTopicMeta<LiveshowTopic>

	constructor(options: {
			label: string
			liveshowTopic: LiveshowTopic
		}) {
		this.label = options.label
		this.liveshowTopic = curryTopicMeta(options.liveshowTopic, async() => {
			const {accessToken} = await this.getAuthContext()
			return {accessToken, appToken: undefined}
		})
	}

	//
	// public actions
	//

	 @action.bound
	ascertainPrivilege(user: MetalUser): LiveshowPrivilegeLevel {
		return evaluators.isPremium(user)
			? LiveshowPrivilegeLevel.Privileged
			: LiveshowPrivilegeLevel.Unprivileged
	}

	 @action.bound
	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {

		// initialize observables
		this.videoLoad = loading.none()
		this.privilege = LiveshowPrivilegeLevel.Unknown

		// setup variables
		this.getAuthContext = null
		const authIsReady: boolean = loading.isReady(authLoad)
		const getAuthContext = loading.payload(authLoad)?.getAuthContext
		const userIsLoggedIn = !!getAuthContext

		// logic for privileges and loading the video
		if (authIsReady) {
			if (userIsLoggedIn) {
				this.getAuthContext = getAuthContext
				const {user} = await getAuthContext()

				// set privilege level
				const privilege = this.ascertainPrivilege(user)
				runInAction(() => this.privilege = privilege)

				// load video
				if (privilege === LiveshowPrivilegeLevel.Privileged) {
					runInAction(() => this.videoLoad = loading.loading())
					const {vimeoId} = (await this.loadVideo()) || {}
					runInAction(() => this.videoLoad = loading.ready({
						vimeoId
					}))
				}
			}
			else this.privilege = LiveshowPrivilegeLevel.Unprivileged
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
			const {label} = this
			await this.liveshowTopic.setShow({
				vimeoId,
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
	private async loadVideo() {
		return await this.liveshowTopic.getShow({
			label: this.label,
		})
	}
}
