
import {namespace} from "./common.js"
import {AuthTokens} from "../../interfaces.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"
import {setupPopup} from "../../toolbox/popups/setup-popup.js"

export const setupAccountPopup = ({
	cors,
	action,
}: {
	cors: CorsPermissions
	action: () => Promise<AuthTokens>
}) => setupPopup<undefined, AuthTokens>({
	cors,
	action,
	namespace,
})
