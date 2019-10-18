
import {Client as CrosscallClient} from "crosscall/dist/client.js"
import {createIframe as crosscallCreateIframe} from "crosscall/dist/create-iframe.js"

import {
	ProfileMagistrateTopic,
	TokenStorageTopic,
} from "./interfaces.js"

export const prefix: string = "authoritarian"

export async function createTokenStorageCrosscallClient({url}: {
	url: string
}): Promise<TokenStorageTopic> {
	const namespace = `${prefix}-token-storage`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = await crosscallCreateIframe({url})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.tokenStorage
}

export async function createProfileMagistrateCacheCrosscallClient({url}: {
	url: string
}): Promise<ProfileMagistrateTopic> {
	const namespace = `${prefix}-profile-magistrate-cache`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = await crosscallCreateIframe({url})
	const client = new CrosscallClient({namespace, hostOrigin, postMessage})
	const {topics} = await client.callable
	return <any>topics.profileMagistrate
}
