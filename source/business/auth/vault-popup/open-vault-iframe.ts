
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {VaultApi} from "../../../types.js"
import {vaultShape} from "../../../types/shapes.js"

import {namespace} from "./types.js"

export async function openVaultIframe({
		authServerOrigin,
		iframePath = "/vault"
	}: {
		iframePath?: string
		authServerOrigin: string
	}) {

	if (iframePath.startsWith("/")) iframePath = iframePath.slice(1)
	const url = `${authServerOrigin}/${iframePath}`

	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<VaultApi>({
		namespace,
		postMessage,
		shape: vaultShape,
		hostOrigin: authServerOrigin,
	})

	return (await callable)
}
