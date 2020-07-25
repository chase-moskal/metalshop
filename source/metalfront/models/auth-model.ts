
import {observable, action, computed} from "mobx"
import * as loading from "../toolbox/loading.js"

import {User, AccessToken, TokenStoreTopic} from "../../types.js"
import {AuthPayload, TriggerAccountPopup, DecodeAccessToken, AuthContext} from "../types.js"

export class AuthModel<U extends User> {
	private expiryGraceSeconds: number
	private tokenStore: TokenStoreTopic
	private authContext: AuthContext<U>
	private decodeAccessToken: DecodeAccessToken<U>
	private triggerAccountPopup: TriggerAccountPopup

	@observable authLoad = loading.load<AuthPayload<U>>()

	@computed get user() {
		return loading.payload(this.authLoad)?.user
	}

	@computed get getAuthContext() {
		return loading.payload(this.authLoad)?.getAuthContext
	}

	constructor(options: {
			expiryGraceSeconds: number
			tokenStore: TokenStoreTopic
			decodeAccessToken: DecodeAccessToken<U>
			triggerAccountPopup: TriggerAccountPopup
		}) {
		Object.assign(this, options)
	}

	 @action.bound
	async useExistingLogin() {
		this.setLoading()
		try {
			const accessToken = await this.tokenStore.passiveCheck()
			if (accessToken) {
				const detail = this.processAccessToken(accessToken)
				this.setLoggedIn(detail)
			}
			else this.setLoggedOut()
		}
		catch (error) {
			this.setError(error)
		}
	}

	 @action.bound
	async loginWithAccessToken(accessToken: AccessToken) {
		await this.tokenStore.writeAccessToken(accessToken)
		if (accessToken) {
			const payload = this.processAccessToken(accessToken)
			this.setLoggedIn(payload)
		}
		else {
			this.setLoggedOut()
		}
	}

	 @action.bound
	async login() {
		this.setLoading()
		try {
			const authTokens = await this.triggerAccountPopup()
			await this.tokenStore.writeTokens(authTokens)
			const payload = this.processAccessToken(authTokens.accessToken)
			this.setLoggedIn(payload)
		}
		catch (error) {
			console.error(error)
		}
	}

	 @action.bound
	async logout() {
		this.setLoading()
		try {
			await this.tokenStore.clearTokens()
			this.authContext = null
			this.setLoggedOut()
		}
		catch (error) {
			this.setError(error)
		}
	}

	 @action.bound
	async reauthorize() {
		this.setLoading()
		try {
			await this.tokenStore.writeAccessToken(null)
			this.authContext = null
			await this.useExistingLogin()
		}
		catch (error) {
			this.setError(error)
		}
	}

	//
	// private methods
	//

	 @action.bound
	private processAccessToken(accessToken: AccessToken): AuthPayload<U> {
		this.authContext = this.decodeAccessToken(accessToken)
		const getAuthContext = async() => {
			const gracedExp = (this.authContext.exp - this.expiryGraceSeconds)
			const expired = gracedExp < (Date.now() / 1000)
			if (expired) {
				const accessToken = await this.tokenStore.passiveCheck()
				this.authContext = this.decodeAccessToken(accessToken)
			}
			return this.authContext
		}
		return {getAuthContext, user: this.authContext.user}
	}

	 @action.bound
	private setError(error: Error) {
		this.authLoad = loading.error(undefined)
		console.error(error)
	}

	 @action.bound
	private setLoading() {
		this.authLoad = loading.loading()
	}

	 @action.bound
	private setLoggedIn({user, getAuthContext}: AuthPayload<U>) {
		this.authLoad = loading.ready({user, getAuthContext})
	}

	 @action.bound
	private setLoggedOut() {
		this.authLoad = loading.ready({user: null, getAuthContext: null})
	}
}

// // reimagined in functional style...
// export function makeAuthModel({
// 		tokenStore,
// 		decodeAccessToken,
// 		expiryGraceSeconds,
// 		triggerAccountPopup,
// 	}: {
// 		expiryGraceSeconds: number
// 		tokenStore: TokenStoreTopic
// 		decodeAccessToken: DecodeAccessToken
// 		triggerAccountPopup: TriggerAccountPopup
// 	}) {

// 	const observables = observelize({
// 		user: <User>null,
// 		getAuthContext: <GetAuthContext>null,
// 		authLoad: loading.load<AuthPayload>(),
// 	})

// 	const privateActions = actionelize({
// 		processAccessToken() {},
// 		setError() {},
// 		setLoading() {},
// 		setLoggedIn() {},
// 		setLoggedOut() {},
// 	})

// 	const actions = actionelize({
// 		async login() {},
// 		async logout() {},
// 		async useExistingLogin() {},
// 		async loginWithAccessToken() {},
// 	})

// 	return {observables, actions}
// }
