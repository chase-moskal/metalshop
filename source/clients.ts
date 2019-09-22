
import {Client as CrosscallClient} from "crosscall/dist/client.js"
import {createApiClient} from "renraku/dist/client/create-api-client.js"
import {createPopup as crosscallCreatePopup} from "crosscall/dist/create-popup.js"
import {createIframe as crosscallCreateIframe} from "crosscall/dist/create-iframe.js"

import {authExchangerApiShape} from "./shapes.js"

import {
	ProfilerTopic,
	AuthExchangerApi,
	TokenStorageTopic,
	AuthExchangerTopic,
} from "./interfaces.js"

export const prefix: string = "authoritarian"

export async function createAuthExchangeRenrakuClient({url}: {
	url: string
}): Promise<AuthExchangerTopic> {
	const {authExchanger} = await createApiClient<AuthExchangerApi>({
		url,
		shape: authExchangerApiShape
	})
	return authExchanger
}

export async function createTokenStorageCrosscallClient({url}: {
	url: string
}): Promise<TokenStorageTopic> {
	const namespace = `${prefix}-token-storage`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = crosscallCreateIframe({url})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.tokenStorage
}

export async function createProfilerCacheCrosscallClient({url}: {
	url: string
}): Promise<ProfilerTopic> {
	const namespace = `${prefix}-profiler-cache`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = crosscallCreateIframe({url})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.profilerTopic
}
