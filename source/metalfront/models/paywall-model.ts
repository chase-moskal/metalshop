
import {action, computed, observable} from "mobx"
import {MetalUser, PremiumPachydermTopic, CardClues, PremiumInfo, TriggerCheckoutPopup, AuthPayload} from "../types.js"

import {AuthModel} from "./auth-model.js"
import * as loading from "../toolbox/loading.js"
import {isPremium} from "../../business/core/user-evaluators.js"

function makeOperationsCenter() {
	let count = 0
	const never: Promise<never> = new Promise(() => {})
	return {
		async run<R>(op: Promise<R>): Promise<R | never> {
			count += 1
			const remember = count
			const result = await op
			return count === remember
				? result
				: never
		},
	}
}

export class PaywallModel {
	private readonly auth: AuthModel<MetalUser>
	private readonly checkoutPopupUrl: string
	private readonly premiumPachyderm: PremiumPachydermTopic
	private readonly triggerCheckoutPopup: TriggerCheckoutPopup
	private readonly operations = makeOperationsCenter()

	 @observable
	premiumInfoLoad: loading.Load<{cardClues: CardClues}> = loading.loading()

	 @computed
	get premium(): boolean {
		return isPremium(this.auth.user)
	}

	 @computed
	get premiumUntil(): number {
		return this.auth.user?.claims.premiumUntil
	}

	constructor(options: {
			auth: AuthModel<MetalUser>
			checkoutPopupUrl: string
			premiumPachyderm: PremiumPachydermTopic
			triggerCheckoutPopup: TriggerCheckoutPopup
		}) {
		Object.assign(this, options)
	}

	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		this.setPremiumInfoLoad(loading.loading())
		if (loading.isReady(authLoad)) {
			const {getAuthContext} = loading.payload(authLoad)
			const {accessToken} = await getAuthContext()
			try {
				const info = await this.operations.run(
					this.premiumPachyderm.getPremiumDetails({accessToken})
				)
				this.setPremiumInfoLoad(loading.ready(info))
			}
			catch (error) {
				console.error(error)
				this.setPremiumInfoLoad(loading.error("unable to load premium info"))
			}
		}
	}

	 @action.bound
	async checkoutPremium() {
		const {accessToken} = await this.auth.getAuthContext()
		const {stripeSessionId} = await this.premiumPachyderm.checkoutPremium({
			accessToken,
			popupUrl: this.checkoutPopupUrl,
		})
		await this.triggerCheckoutPopup({stripeSessionId})
		await this.auth.reauthorize()
	}

	 @action.bound
	async updatePremium() {
		const {accessToken} = await this.auth.getAuthContext()
		const {stripeSessionId} = await this.premiumPachyderm.updatePremium({
			accessToken,
			popupUrl: this.checkoutPopupUrl,
		})
		await this.triggerCheckoutPopup({stripeSessionId})
		await this.auth.reauthorize()
	}

	 @action.bound
	async cancelPremium() {
		const {accessToken} = await this.auth.getAuthContext()
		await this.premiumPachyderm.cancelPremium({accessToken})
		await this.auth.reauthorize()
	}

	 @action.bound
	private setPremiumInfoLoad(info: loading.Load<PremiumInfo>) {
		this.premiumInfoLoad = info
	}
}
