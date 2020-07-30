
import {ButtonPremiumShare} from "../types.js"
import * as loading from "../toolbox/loading.js"
import {MetalshopComponent, html} from "../framework/metalshop-component.js"

export class MetalButtonPremium extends MetalshopComponent<ButtonPremiumShare> {

	onSubscribeClick = async() => {
		const loggedIn = !!(loading.payload(this.share.personalLoad)?.user)
		if (!loggedIn) await this.share.login()
		if (!this.share.premium) {
			console.log("CHECKOUT PREMIUM")
			await this.share.checkoutPremium()
		}
		else console.log("ALREADY PREMIUM")
	}

	render() {
		return html`
			<metal-is-premium class=coolbuttonarea>
				<div slot=not>
					<button @click=${this.onSubscribeClick}>
						Subscribe Premium
					</button>
				</div>
			</metal-is-premium>
		`
	}
}
