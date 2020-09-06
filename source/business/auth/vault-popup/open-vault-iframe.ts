
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {VaultApi} from "../../../types.js"
import {vaultShape} from "../../../types/shapes.js"

import {namespace} from "./types.js"

export async function openVaultIframe({
		coreServerOrigin,
		iframePath = "/vault"
	}: {
		iframePath?: string
		coreServerOrigin: string
	}) {

	if (iframePath.startsWith("/")) iframePath = iframePath.slice(1)
	const url = `${coreServerOrigin}/${iframePath}`

	const {postMessage} = await createIframe({url})
	const {callable} = crosscallClient<VaultApi>({
		namespace,
		postMessage,
		shape: vaultShape,
		hostOrigin: coreServerOrigin,
	})

	return (await callable)
}
