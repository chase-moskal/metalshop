
import {verifyCors} from "renraku/dist/verify-cors.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"

import {
	AuthTokens,
	AccountPopupEvent,
	AccountPopupMessage,
	AccountPopupLoginRequest,
	AccountPopupLoginResponse,
} from "../interfaces.js"
import {err, namespace, isLoginMessage} from "./account-popup-common.js"

export async function accountPopupHost({cors, auth}: {
	cors: CorsPermissions
	auth: () => Promise<AuthTokens>
}) {
	const opener: Window = window.opener

	if (opener) window.addEventListener("message", listener)
	else listener(<any>{
		origin: window.location.origin,
		data: <AccountPopupMessage>{
			namespace,
			topic: "login"
		}
	})

	async function listener(
		request: AccountPopupEvent<AccountPopupLoginRequest>
	) {

		// check if the message is even relevant to us
		// (we need to ignore google-related messages flying around)
		const relevant = isLoginMessage(request.data)

		// security: cross-origin whitelist/blacklist
		const valid = verifyCors({cors, origin: request.origin})

		// respond with auth tokens
		if (relevant && valid) {
			if (valid) {
				const message: AccountPopupLoginResponse = {
					namespace,
					topic: "login",
					tokens: await auth(),
				}
				opener.postMessage(message, request.origin)
			}
			else console.warn(
				`message denied, from origin "${request.origin}"`,
				request.data
			)
		}
	}
}
