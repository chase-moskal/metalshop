
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {tokenStorageShape} from "../shapes.js"
import {TokenStorageApi} from "../interfaces.js"

export const prefix: string = "authoritarian"

export async function createTokenStorageClient({url}: {url: string}) {
	const namespace = `${prefix}-token-storage`
	const {origin: hostOrigin} = new URL(url)
	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<TokenStorageApi>({
		namespace,
		hostOrigin,
		postMessage,
		shape: tokenStorageShape
	})
	return (await callable).tokenStorage
}
