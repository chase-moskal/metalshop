
import {namespace} from "./common.js"
import {openPopup} from "../../../toolbox/popups/open-popup.js"
import {CheckoutPopupParameters, CheckoutPopupPayload} from "./interfaces.js"

export const openCheckoutPopup = ({
	stripeSessionId,
	paywallServerOrigin,
	popupPath = "/html/checkout-popup",
}: {
	stripeSessionId: string
	paywallServerOrigin: string
	popupPath?: string
}) => openPopup<CheckoutPopupParameters, CheckoutPopupPayload>({
	namespace,
	popupPath,
	parameters: {stripeSessionId},
	popupOrigin: paywallServerOrigin,
})
