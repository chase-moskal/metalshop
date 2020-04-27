
import {loadStripe} from "@stripe/stripe-js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"

import {namespace} from "./common.js"
import {PaywallPopupState} from "./interfaces.js"
import {validateRequest} from "../../toolbox/popups/validate-request.js"
import {PaywallPopupParameters, PaywallPopupPayload} from "../../business/paywall-popup/interfaces.js"
import {PopupFlag, PopupReadyResponse, PopupMessageEvent, PopupGoRequest, PopupPayloadResponse} from "../../toolbox/popups/interfaces.js"

export const setupPaywallPopup = ({
	cors,
	state,
	stripeApiKey,
}: {
	stripeApiKey: string
	cors: CorsPermissions
	state: PaywallPopupState
}) => {
	if (state === PaywallPopupState.Initial) {

		// RECEIVE POSTMESSAGE GoRequest
		// - userId
		window.addEventListener("message", async function goListener(
			event: PopupMessageEvent<PopupGoRequest<PaywallPopupParameters>>
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
	else if (state === PaywallPopupState.Done) {
		document.body.innerHTML = "Done"

		//
		// RECEIVE POSTMESSAGE GoRequest
		//
		window.addEventListener("message", async function goListener(
			event: PopupMessageEvent<PopupGoRequest<PaywallPopupParameters>>
		) {

			// SEND POSTMESSAGE PayloadResponse
			opener.postMessage(<PopupPayloadResponse<PaywallPopupPayload>>{
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
