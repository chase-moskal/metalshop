
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {namespace} from "./common.js"
import {tokenStorageShape} from "../../shapes.js"
import {TokenStorageApi} from "../../interfaces.js"

export async function createTokenStorageClient({
	authServerOrigin,
	iframePath = "/html/token-storage"
}: {
	iframePath?: string
	authServerOrigin: string
}) {
	if (iframePath.startsWith("/")) iframePath = iframePath.slice(1)
	
	const url = `${authServerOrigin}/${iframePath}`
	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<TokenStorageApi>({
		namespace,
		hostOrigin: authServerOrigin,
		postMessage,
		shape: tokenStorageShape
	})
	return (await callable).tokenStorage
}
