
import {namespace} from "./common.js"
import {openPopup} from "../../toolbox/popups/open-popup.js"
import {PaywallPopupParameters, PaywallPopupPayload} from "./interfaces.js"

export const openPaywallPopup = ({
	stripeSessionId,
	paywallServerOrigin,
	popupPath = "/html/paywall-popup",
}: {
	stripeSessionId: string
	paywallServerOrigin: string
	popupPath?: string
}) => openPopup<PaywallPopupParameters, PaywallPopupPayload>({
	namespace,
	popupPath,
	parameters: {stripeSessionId},
	popupOrigin: paywallServerOrigin,
})
