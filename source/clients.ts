
import {Client as CrosscallClient} from "crosscall/dist/client.js"
import {createIframe as crosscallCreateIframe} from "crosscall/dist/create-iframe.js"

import {
	ProfilerTopic,
	TokenStorageTopic,
} from "./interfaces.js"

export const prefix: string = "authoritarian"

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
