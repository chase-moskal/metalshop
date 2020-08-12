
import {CheckoutPopupSettings} from "./types.js"

import {unpackCorsConfig} from "../../../toolbox/unpack-cors-config.js"
import {CheckoutPopupState} from "../../../business/paywall/checkout-popup/types.js"
import {setupCheckoutPopup} from "../../../business/paywall/checkout-popup/setup-checkout-popup.js"

declare global {
	interface Window {
		settings: CheckoutPopupSettings
	}
}

~async function main() {
	const {settings} = window
	const cors = unpackCorsConfig(settings.cors)
	const {stripeApiKey} = settings

	const {hash} = window.location
	const success = hash.endsWith("success")
	const cancel = hash.endsWith("cancel")
	const initial = !(success || cancel)
	const state: CheckoutPopupState = initial
		? CheckoutPopupState.Initial
		: CheckoutPopupState.Done

	setupCheckoutPopup({
		cors,
		state,
		stripeApiKey,
	})

}().catch(error => console.error(error))
