
import {createIframe} from "crosscall/dist/create-iframe.js"
import {crosscallClient} from "crosscall/dist/crosscall-client.js"

import {namespace} from "./common.js"
import {VaultApi} from "../../../types.js"
import {vaultShape} from "../../../shapes.js"

export async function openVaultIframe({
		authServerOrigin,
		iframePath = "/html/vault"
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
