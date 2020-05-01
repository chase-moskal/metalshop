
import {namespace} from "./common.js"
import {AuthTokens} from "../../../interfaces.js"
import {openPopup} from "../../../toolbox/popups/open-popup.js"

export const openAccountPopup = ({
		authServerOrigin,
		popupPath = "/html/account-popup",
	}: {
		popupPath?: string
		authServerOrigin: string
	}) => openPopup<undefined, AuthTokens>({

	namespace,
	popupPath,
	parameters: undefined,
	popupOrigin: authServerOrigin,
})
