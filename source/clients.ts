
import {Client as CrosscallClient} from "crosscall/dist/client.js"
import {createApiClient} from "renraku/dist/client/create-api-client.js"
import {createPopup as crosscallCreatePopup} from "crosscall/dist/create-popup.js"
import {createIframe as crosscallCreateIframe} from "crosscall/dist/create-iframe.js"

import {authExchangerApiShape} from "./shapes.js"

import {
	AuthExchangerApi,
	AccountPopupTopic,
	TokenStorageTopic,
	AuthExchangerTopic,
} from "./interfaces.js"

export const namespace: string = "authoritarian"

export async function createAuthExchangeRenrakuClient({url}: {
	url: string
}): Promise<AuthExchangerTopic> {
	const {authExchanger} = await createApiClient<AuthExchangerApi>({
		url,
		shape: authExchangerApiShape
	})
	return authExchanger
}

export async function createAccountPopupCrosscallClient({url, hostOrigin}: {
	url: string
	hostOrigin: string
}): Promise<AccountPopupTopic> {
	const {postMessage} = crosscallCreatePopup({
		url,
		target: "_blank",
		features: "title=0,width=360,height=200",
		replace: true
	})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.accountPopup
}

export async function createTokenStorageCrosscallClient({url, hostOrigin}: {
	url: string
	hostOrigin: string
}): Promise<TokenStorageTopic> {
	const {postMessage} = crosscallCreateIframe({url})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.tokenStorage
}
