
import {namespace} from "./common.js"
import {User} from "../../interfaces.js"
import {openPopup} from "../../toolbox/popups/open-popup.js"

export const openPaywallPopup = ({
	paywallServerOrigin,
	popupPath = "/html/paywall-popup",
}: {
	popupPath?: string
	paywallServerOrigin: string
}) => openPopup<null, User>({
	namespace,
	popupPath,
	parameters: undefined,
	popupOrigin: paywallServerOrigin,
})
