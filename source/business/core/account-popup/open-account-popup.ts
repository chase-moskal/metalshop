
import {AuthTokens} from "../../../types.js"
import {openPopup} from "../../../toolbox/popups/open-popup.js"

import {namespace} from "./types.js"

export const openAccountPopup = ({
		authServerOrigin,
		popupPath = "/account",
	}: {
		popupPath?: string
		authServerOrigin: string
	}) => openPopup<undefined, AuthTokens>({

	namespace,
	popupPath,
	parameters: undefined,
	popupOrigin: authServerOrigin,
})
