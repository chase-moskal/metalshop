
import {namespace} from "./common.js"
import {openPopup} from "../../toolbox/popups/open-popup.js"
import {PaywallPopupParameters, PaywallPopupPayload} from "./interfaces.js"

export const openPaywallPopup = ({
	userId,
	stripePlanId,
	paywallServerOrigin,
	popupPath = "/html/paywall-popup",
}: {
	userId: string
	stripePlanId: string
	popupPath?: string
	paywallServerOrigin: string
}) => openPopup<PaywallPopupParameters, PaywallPopupPayload>({
	namespace,
	popupPath,
	parameters: {
		userId,
		stripePlanId,
	},
	popupOrigin: paywallServerOrigin,
})
