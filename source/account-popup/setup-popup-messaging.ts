
import {verifyCors} from "renraku/dist/verify-cors.js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"

import {
	AuthTokens,
	AccountPopupEvent,
	AccountPopupMessage,
	AccountPopupMessageFlag,
	AccountPopupReadyResponse,
	AccountPopupResultResponse,
} from "../interfaces.js"
import {namespace, isRelevant} from "./account-popup-common.js"

/** Validate messages from the page, enforce cors rules */
function validate(
	event: AccountPopupEvent<AccountPopupMessage>,
	cors: CorsPermissions
): boolean {
	const {origin, data: message} = event

	// check if the message is even relevant to us
	// (we need to ignore google-related messages flying around)
	const relevant = isRelevant(message)

	if (relevant) {

		// security: cross-origin whitelist/blacklist
		if (verifyCors({cors, origin}))
			return true

		else
			console.warn(
				`message denied, from origin "${origin}"`,
				message
			)
	}

	return false
}

/** Function to prepare responders to send messages back to the page */
const prepareResponders = (
	respond: (message: AccountPopupMessage) => void
) => ({
	sendReadyMessage: () =>
		respond(<AccountPopupReadyResponse>{
			namespace,
			flag: AccountPopupMessageFlag.ReadyResponse,
		}),
	respondWithTokens: (tokens: AuthTokens) =>
		respond(<AccountPopupResultResponse>{
			tokens,
			namespace,
			flag: AccountPopupMessageFlag.ResultResponse,
		}),
})

/**
 * Act as an account popup, given an auth action and cors access rules
 * - engage postmessage communication with a parent page
 */
export async function setupPopupMessaging({auth, cors}: {
	cors: CorsPermissions
	auth: () => Promise<AuthTokens>
}) {
	const opener: Window = window.opener
	if (opener) {
		const broadcast = prepareResponders(
			message => opener.postMessage(message, "*")
		)

		// react when this popup closes
		window.addEventListener("unload", () => broadcast.respondWithTokens(null))

		// send "ready" message, to indicate that we're done loading
		broadcast.sendReadyMessage()

		// listen for "go" request, to start auth routine and send back results
		window.addEventListener(
			"message",
			async function goListener(event: AccountPopupEvent<AccountPopupMessage>) {
				if (validate(event, cors)) {
					window.removeEventListener("message", goListener)

					const responders = prepareResponders(
						message => opener.postMessage(message, event.origin)
					)

					// perform auth, and respond
					try {
						const tokens = await auth()
						responders.respondWithTokens(tokens)
					}
					catch (error) {
						console.warn(error)
						responders.respondWithTokens(null)
					}
				}
			}
		)
	}
	else {
		console.log("running standalone")
		console.log(await auth())
	}
}
