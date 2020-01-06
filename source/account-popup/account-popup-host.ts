
import {verifyCors} from "renraku/dist/verify-cors.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"

import {
	AuthTokens,
	AccountPopupEvent,
	AccountPopupMessage,
	AccountPopupLoginRequest,
	AccountPopupLoginResponse,
} from "../interfaces.js"
import {err, namespace, isRelevant} from "./account-popup-common.js"

export async function accountPopupHost({auth, cors}: {
	cors: CorsPermissions
	auth: () => Promise<AuthTokens>
}) {

	//
	// internal functionality
	//

	let respond: (response: AccountPopupLoginResponse) => void

	const respondWithNothing = () =>
		respond({namespace, tokens: null})

	const respondWithTokens = (tokens: AuthTokens) =>
		respond({namespace, tokens})

	const authAction = async({
		data,
		origin,
	}: AccountPopupEvent<AccountPopupLoginRequest>) => {

		// check if the message is even relevant to us
		// (we need to ignore google-related messages flying around)
		const relevant = isRelevant(data)

		// security: cross-origin whitelist/blacklist
		const valid = verifyCors({cors, origin})

		// respond or not
		if (relevant) {
			if (valid) {
				try {
					respondWithTokens(await auth())
				}
				catch (error) {
					console.error(error)
					respondWithNothing()
				}
			}
			else console.warn(
				`message denied, from origin "${origin}"`,
				data
			)
		}
	}

	//
	// account popup procedure
	//

	const opener: Window = window.opener

	// if this window has an opener, then it's a popup
	if (opener) {

		// the way we respond is via postmessage
		respond = (message: AccountPopupLoginResponse) =>
			opener.postMessage(message, opener.origin)

		// when this popup closes, respond to opener with null
		window.addEventListener("unload", respondWithNothing)
		
		// wait for a message from the opener to begin
		window.addEventListener("message", authAction)
	}

	// otherwise without an opener, this window is standalone, for testing
	else {

		// log all responses to the console instead of sending them anywhere
		respond = (message: AccountPopupLoginResponse) => console.log(message)

		// begin the auth action immediately
		await authAction(<any>{
			origin: window.location.origin,
			data: <AccountPopupMessage>{namespace}
		})
	}
}
