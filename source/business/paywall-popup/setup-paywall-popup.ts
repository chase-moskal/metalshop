
import {namespace} from "./common.js"
import {User} from "../../interfaces.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"
import {setupPopup} from "../../toolbox/popups/setup-popup.js"

export const setupPaywallPopup = ({
	cors,
	action,
}: {
	cors: CorsPermissions
	action: () => Promise<User>
}) => setupPopup<undefined, User>({
	cors,
	action,
	namespace,
})
