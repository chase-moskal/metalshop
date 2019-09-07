
import * as renraku from "renraku"
import * as crosscall from "crosscall"

import {authExchangerApiShape} from "./shapes.js"

import {
	AuthExchangerApi,
	AccountPopupTopic,
	TokenStorageTopic,
	AuthExchangerTopic
} from "./interfaces.js"

export async function createAuthExchangeRenrakuClient({url}: {
	url: string
}): Promise<AuthExchangerTopic> {
	const {authExchanger} = await renraku.createApiClient<AuthExchangerApi>({
		url,
		shape: authExchangerApiShape
	})
	return authExchanger
}

export async function createAccountPopupCrosscallClient({url, hostOrigin}: {
	url: string
	hostOrigin: string
}): Promise<AccountPopupTopic> {
	const {postMessage} = crosscall.createPopup({
		url,
		target: "_blank",
		features: "title=0,width=360,height=200",
		replace: true
	})
	const client = new crosscall.Client({hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.accountPopup
}

export async function createTokenStorageCrosscallClient({url, hostOrigin}: {
	url: string
	hostOrigin: string
}): Promise<TokenStorageTopic> {
	const {postMessage} = crosscall.createIframe({url})
	const client = new crosscall.Client({hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.tokenStorage
}
