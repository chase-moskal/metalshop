
import {unpackCorsConfig} from "../../../toolbox/unpack-cors-config.js"
import {setupAccountPopup} from "../../../business/core/account-popup/setup-account-popup.js"

import {AccountSettings} from "./types.js"
import {prepareAuth} from "./auth/prepare-auth.js"

declare global {
	interface Window {
		startReady: boolean
		start: () => void
		settings: AccountSettings
	}
}

window.start = function start() {
	// const {settings} = window
	// const auth = prepareAuth(settings.googleAuthDetails)
	// const cors = unpackCorsConfig(settings.cors)
	// setupAccountPopup({auth, cors})
}

if (window.startReady) window.start()
