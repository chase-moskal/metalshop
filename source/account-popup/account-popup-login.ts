
import {
	AuthTokens,
	AccountPopupEvent,
	AccountPopupLoginRequest,
	AccountPopupLoginResponse,
} from "../interfaces.js"

import {
	err,
	namespace,
	isLoginMessage,
} from "./account-popup-common.js"

/**
 * Trigger an account popup to appear, harvest and return the auth tokens
 * - must be called from user-initiated callstack (like a click event),
 *   otherwise popup blockers will prevent functionality
 * - custom post-message logic communicates with the popup
 * - add a 'message' event listener to window for popup communication
 */
export async function accountPopupLogin(authServerUrl: string):
 Promise<AuthTokens> {
	const {origin: authServerOrigin} = new URL(authServerUrl)

	const popup = window.open(
		`${authServerOrigin}/html/account-popup`,
		namespace,
		popupFeatures(),
		true
	)

	popup.focus()

	return new Promise<AuthTokens>((resolve, reject) => {
		const requestMessage: AccountPopupLoginRequest = {namespace, topic: "login"}
		popup.postMessage(requestMessage, authServerOrigin)

		window.addEventListener("message", function listener(
		 response: AccountPopupEvent<AccountPopupLoginResponse>
		) {
			try {
				const message = response.data
				const relevant = isLoginMessage(message)

				// security: make sure the origins match
				const valid =
					response.origin.toLowerCase() === authServerOrigin.toLowerCase()

				if (relevant) {
					if (valid) {
						const {tokens} = message
						if (tokens) {
							window.removeEventListener("message", listener)
							popup.close()
							resolve(tokens)
						}
						else throw err(`tokens missing`)
					}
					else throw err(`message failed origin check`)
				}
			}
			catch (error) {
				reject(error)
			}
		})
	})
}

/**
 * Features to place popup center screen
 */
function popupFeatures(width = 260, height = 260) {
	const {outerWidth, outerHeight, screenY, screenX} = window.top
	const top = ((outerHeight / 2) + screenY - (height / 2)) / 2
	const left = (outerWidth / 2) + screenX - (width / 2)
	return `
		width=${width},
		height=${height},
		top=${top},
		left=${left},
		toolbar=no,
		location=no,
		status=no,
		menubar=no,
		scrollbars=yes,
		resizable=yes
	`
}
