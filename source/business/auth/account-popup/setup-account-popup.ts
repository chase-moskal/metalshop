
import {namespace} from "./common.js"
import {AuthTokens} from "../../../interfaces.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"
import {setupPopup} from "../../../toolbox/popups/setup-popup.js"

export const setupAccountPopup = ({
	cors,
	auth: action,
}: {
	cors: CorsPermissions
	auth: () => Promise<AuthTokens>
}) => setupPopup<undefined, AuthTokens>({
	cors,
	action,
	namespace,
})
