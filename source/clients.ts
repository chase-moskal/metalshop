
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {
	TokenStorageApi,
	ProfileMagistrateCacheApi,
} from "./interfaces.js"
import {tokenStorageShape, profileMagistrateCacheShape} from "./shapes.js"

export const prefix: string = "authoritarian"

export async function tokenStorageClient({url}: {url: string}) {
	const namespace = `${prefix}-token-storage`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<TokenStorageApi>({
		namespace,
		hostOrigin,
		postMessage,
		shape: tokenStorageShape
	})
	const {tokenStorage} = await callable
	return {tokenStorage}
}

export async function profileMagistrateCacheClient({url}: {url: string}) {
	const namespace = `${prefix}-profile-magistrate-cache`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<ProfileMagistrateCacheApi>({
		namespace,
		hostOrigin,
		postMessage,
		shape: profileMagistrateCacheShape
	})
	const {profileMagistrateCache} = await callable
	return {profileMagistrateCache}
}
