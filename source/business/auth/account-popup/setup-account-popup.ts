
import {CorsPermissions} from "crosscall/dist/types.js"

import {AuthTokens} from "../../../types.js"
import {setupPopup} from "../../../toolbox/popups/setup-popup.js"

import {namespace} from "./types.js"

export const setupAccountPopup = ({
		cors,
		auth,
	}: {
		cors: CorsPermissions
		auth: () => Promise<AuthTokens>
	}) => setupPopup<undefined, AuthTokens>({

	cors,
	namespace,
	action: auth,
})
