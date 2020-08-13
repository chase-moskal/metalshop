
import {loadStripe} from "@stripe/stripe-js"
import {CorsPermissions} from "../../../types.js"

import {validateRequest} from "../../../toolbox/popups/validate-request.js"
import {PopupFlag, PopupReadyResponse, PopupMessageEvent, PopupGoRequest, PopupPayloadResponse} from "../../../toolbox/popups/interfaces.js"

import {namespace, CheckoutPopupParameters, CheckoutPopupPayload, CheckoutPopupState} from "./types.js"

export const setupCheckoutPopup = ({
	cors,
	state,
	stripeApiKey,
}: {
	stripeApiKey: string
	cors: CorsPermissions
	state: CheckoutPopupState
}) => {
	if (state === CheckoutPopupState.Initial) {

		// RECEIVE POSTMESSAGE GoRequest
		// - userId
		window.addEventListener("message", async function goListener(
			event: PopupMessageEvent<PopupGoRequest<CheckoutPopupParameters>>
		) {

			// don't continue unless the request is validated
			if (!validateRequest({namespace, event, cors}))
				return null

			// stop listening (only listen once, it's a one-off)
			window.removeEventListener("message", goListener)

			// extract parameters out of the go request
			const {stripeSessionId} = event.data.parameters

			// initiate the stripe redirection flow
			const stripe = await loadStripe(stripeApiKey)
			stripe.redirectToCheckout({sessionId: stripeSessionId})
		})
	}
	else if (state === CheckoutPopupState.Done) {
		document.body.innerHTML = "Done"

		//
		// RECEIVE POSTMESSAGE GoRequest
		//
		window.addEventListener("message", async function goListener(
			event: PopupMessageEvent<PopupGoRequest<CheckoutPopupParameters>>
		) {

			// SEND POSTMESSAGE PayloadResponse
			opener.postMessage(<PopupPayloadResponse<CheckoutPopupPayload>>{
				namespace,
				payload: {},
				flag: PopupFlag.PayloadResponse,
			}, event.origin)
		})
	}

	// SEND POSTMESSAGE BROADCAST ReadyResponse
	opener.postMessage(<PopupReadyResponse>{
		namespace,
		flag: PopupFlag.ReadyResponse
	}, "*")
}
