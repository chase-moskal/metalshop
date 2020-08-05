
import {PaywallShare} from "../types.js"
import * as loading from "../toolbox/loading.js"
import {star as starIcon} from "../system/icons.js"
import {styles} from "./styles/metal-paywall-styles.js"
import {mixinStyles} from "../framework/mixin-styles.js"
import {MetalshopComponent, html, property} from "../framework/metalshop-component.js"

 @mixinStyles(styles)
export class MetalPaywall extends MetalshopComponent<PaywallShare> {

	 @property({type: Object})
	paywallLoad: loading.Load<void> = loading.ready<void>()

	render() {
		const {paywallLoad} = this
		const {personalLoad, premiumUntil, premium, premiumInfoLoad} = this.share
		const meta = loading.meta(personalLoad, premiumInfoLoad, paywallLoad)
		const premiumInfo = loading.payload(premiumInfoLoad)
		return html`
			<iron-loading .load=${meta} class="coolbuttonarea">
				${premium
					? this.renderPanelPremium()
					: this.renderPanelNoPremium()}
				${premiumInfo
					? this.renderPanelSubscription()
					: this.renderPanelNoSubscription()}
			</iron-loading>
		`
	}

	private renderPanelPremium() {
		return html`
			<div class="panel premium">
				${starIcon}
				<h3>Premium</h3>
			</div>
		`
	}

	private renderPanelNoPremium() {
		return html`
			<div class="panel no-premium">
				<h3>Not premium</h3>
			</div>
		`
	}

	private renderPanelSubscription() {
		const {cardClues} = loading.payload(this.share.premiumInfoLoad)
		const {brand, last4, expireYear, expireMonth} = cardClues
		return html`
			<div class="panel subscription">
				<h3>Billing subscription is active</h3>
				<p>${brand} ends in ${last4} expires ${expireYear}/${expireMonth}</p>
				<div class="buttonbar">
					<button class="update" @click=${this.handleUpdatePremiumClick}>
						Update
					</button>
					<button class="cancel" @click=${this.handleCancelPremiumClick}>
						Cancel
					</button>
				</div>
			</div>
		`
	}

	private renderPanelNoSubscription () {
		const {premiumUntil, premium} = this.share
		const days = (() => {
			if (!premiumUntil) return null
			const duration = premiumUntil - Date.now()
			return Math.ceil(duration / (1000 * 60 * 60 * 24))
		})()
		return html`
			<div class="panel no-subscription">
				${days
					? html`<p>Remaining: ${days} day${days === 1 ? "": "s"}</p>`
					: null}
				<p>No active billing subscription</p>
				${premium
					? null
					: html`
						<div class="buttonbar">
							<button class="subscribe" @click=${this.handleCheckoutPremiumClick}>
								Subscribe
							</button>
						</div>
					`
				}
			</div>
		`
	}

	private loadingOp = async<P extends any>(func: () => Promise<P>): Promise<P> => {
		this.paywallLoad = loading.loading()
		try {
			const result = await func()
			this.paywallLoad = loading.ready()
			return result
		}
		catch (error) {
			console.error(error)
			this.paywallLoad = loading.error()
			throw error
		}
	}

	private async handleCheckoutPremiumClick() {
		await this.loadingOp(async() => this.share.checkoutPremium())
	}

	private async handleUpdatePremiumClick() {
		await this.loadingOp(async () => this.share.updatePremium())
	}

	private async handleCancelPremiumClick() {
		await this.loadingOp(async () => this.share.cancelPremium())
	}
}
