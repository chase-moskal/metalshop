
import {action, computed} from "mobx"

import {TriggerCheckoutPopup} from "../types.js"
import {PaywallUser, PremiumPachydermTopic} from "../../types.js"

import {AuthModel} from "./auth-model.js"
import {PersonalModel} from "./personal-model.js"

export class PaywallModel<U extends PaywallUser> {
	private readonly auth: AuthModel<U>
	private readonly personal: PersonalModel
	private readonly checkoutPopupUrl: string
	private readonly premiumPachyderm: PremiumPachydermTopic
	private readonly triggerCheckoutPopup: TriggerCheckoutPopup

	constructor(options: {
			auth: AuthModel<U>
			personal: PersonalModel
			checkoutPopupUrl: string
			premiumPachyderm: PremiumPachydermTopic
			triggerCheckoutPopup: TriggerCheckoutPopup
		}) {
		Object.assign(this, options)
	}

	 @computed
	get premiumClaim(): boolean {
		return !!this.auth.user?.claims?.premium
	}

	 @computed
	get premiumExpires(): number {
		return this.personal.settings?.premium?.expires
	}

	 @computed
	get premiumSubscription() {
		return this.personal.settings?.billing?.premiumSubscription
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
}
