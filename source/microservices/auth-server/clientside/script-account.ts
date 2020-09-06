
import {unpackCorsConfig} from "../../../toolbox/unpack-cors-config.js"
import {setupAccountPopup} from "../../../business/auth/account-popup/setup-account-popup.js"

import {AccountSettings} from "./types.js"
import {prepareAuth} from "./auth/prepare-auth.js"

const win: Window & {
	startReady: boolean
	settings: AccountSettings
	start: () => void
} = <any>window

win.start = function start() {
	const {settings} = win
	const auth = prepareAuth(settings.googleAuthDetails)
	const cors = unpackCorsConfig(settings.cors)
	setupAccountPopup({auth, cors})
}

if (win.startReady) win.start()
