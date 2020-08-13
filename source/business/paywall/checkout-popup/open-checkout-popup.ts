
import {openPopup} from "../../../toolbox/popups/open-popup.js"
import {namespace, CheckoutPopupParameters, CheckoutPopupPayload} from "./types.js"

export const openCheckoutPopup = ({
	stripeSessionId,
	paywallServerOrigin,
	popupPath = "/checkout-popup",
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
