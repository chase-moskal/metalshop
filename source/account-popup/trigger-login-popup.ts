
import {
	AuthTokens,
	AccountPopupEvent,
	AccountPopupMessage,
	AccountPopupGoRequest,
	AccountPopupMessageFlag,
	AccountPopupResultResponse,
} from "../interfaces.js"

import {
	err,
	namespace,
	isRelevant,
} from "./account-popup-common.js"

/**
 * Trigger an account popup to appear, harvest and return the auth tokens
 * - must be called from user-initiated callstack (like a click event),
 *   otherwise popup blockers will prevent functionality
 * - custom post-message logic communicates with the popup
 */
export async function triggerLoginPopup({accountPopupUrl}: {
	accountPopupUrl: string
}): Promise<AuthTokens> {
	return new Promise<AuthTokens>((resolve, reject) => {

		const {origin: popupOrigin} = new URL(accountPopupUrl)

		const popup = window.open(
			accountPopupUrl,
			namespace,
			popupFeaturesCentered(),
			true,
		)

		popup.focus()

		const {startListening} = prepareAccountPopupMessageListener({
			popup,
			popupOrigin,
			resultCallback: (error, tokens) => {
				if (error) reject(error)
				else resolve(tokens)
			}
		})

		startListening()
	})
}

/** Validate message from popup */
function validate({response, popupOrigin}: {
	popupOrigin: string
	response: AccountPopupEvent<AccountPopupMessage>
}): boolean {
	const message = response.data
	const relevant = isRelevant(message)
	if (relevant) {
		if (response.origin.toLowerCase() === popupOrigin.toLowerCase())
			return true
		else
			console.warn(
				`message denied, from origin "${response.origin}"`,
				response
			)
	}
	return false
}

/** Prepare account popup message listener and use callback to get results */
function prepareAccountPopupMessageListener({
	popup,
	popupOrigin,
	resultCallback,
}: {
	popup: Window
	popupOrigin: string
	resultCallback: (error: Error, tokens: AuthTokens) => void
}) {

	const startListening = () => {
		window.addEventListener("message", messageListener)
	}

	const closePopup = () => {
		window.removeEventListener("message", messageListener)
		popup.close()
	}

	const sendGo = () => popup.postMessage(<AccountPopupGoRequest>{
		namespace,
		flag: AccountPopupMessageFlag.GoRequest
	}, popupOrigin)

	function messageListener(response: AccountPopupEvent<AccountPopupMessage>) {
		const message = response.data

		if (validate({response, popupOrigin})) {
			try {

				// handle "ready" response message by sending "go"
				if (message.flag === AccountPopupMessageFlag.ReadyResponse)
					sendGo()

				// handle "result" response, give results to callback
				else if (message.flag === AccountPopupMessageFlag.ResultResponse) {
					const {tokens} = <AccountPopupResultResponse>message
					if (tokens) {
						closePopup()
						resultCallback(undefined, tokens)
					}
					else throw err(`no tokens`)
				}

				else throw err(`unknown message flag`)
			}
			catch (error) {
				closePopup()
				resultCallback(error, undefined)
			}
		}
	}

	return {startListening}
}

function popupFeaturesCentered(width = 260, height = 260) {
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
