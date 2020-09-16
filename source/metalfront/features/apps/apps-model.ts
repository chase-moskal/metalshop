
import {action, computed, observable} from "mobx"
import {MetalUser, Personal, PremiumPachydermTopic, CardClues, PremiumInfo, TriggerCheckoutPopup, AuthPayload} from "../../types.js"

import {observelize, actionelize} from "../../framework/mobb.js"
import * as loading from "../../toolbox/loading.js"
import {App, AppAlpacaTopic} from "./apps-types.js"

export function makeAppsModel() {
	const observables = observelize({
		authLoad: <loading.Load<AuthPayload<MetalUser>>>loading.loading(),
		appsLoad: <loading.Load<App[]>>loading.loading(),
	})

	const internalActions = actionelize({
		setAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
			observables.authLoad = authLoad
		},
		setAppsLoad(appsLoad: loading.Load<App[]>) {
			observables.appsLoad = appsLoad
		},
	})

	const actions = {
		listApps({accessToken, userId}) {},
		registerApp({accessToken, userId, draft}) {},
	}
}

export class AppsModel {

	 @observable
	authLoad: loading.Load<AuthPayload<MetalUser>>

	 @observable
	appsLoad: loading.Load<App[]> = loading.loading()

	private readonly appAlpaca: AppAlpacaTopic

	constructor({appAlpaca}: {appAlpaca: AppAlpacaTopic}) {
		this.appAlpaca = appAlpaca
	}

	async listApps() {}

	async registerApp() {}

	async createAppToken() {}

	async forgetAppToken() {}
}
