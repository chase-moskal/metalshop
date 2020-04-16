
import {namespace} from "./common.js"
import {loadStripe} from "@stripe/stripe-js"
import {CorsPermissions} from "crosscall/dist/interfaces.js"

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
		// - plan
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
			const {parameters} = event.data
			const {
				stripePlanId: plan,
				userId: clientReferenceId,
			} = parameters

			// construct callback url's for stripe (this page but with querystring)
			const {protocol, host, pathname} = window.location
			const baseUrl = `${protocol}//${host}${pathname}`
			const cancelUrl = `${baseUrl}#cancel`
			const successUrl = `${baseUrl}#success`

			// initiate the stripe redirection flow
			const stripe = await loadStripe(stripeApiKey)
			stripe.redirectToCheckout({
				cancelUrl,
				successUrl,
				clientReferenceId,
				items: [{plan, quantity: 1}],
			})
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
