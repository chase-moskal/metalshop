
import {crosscallHost} from "crosscall/dist/crosscall-host.js"
import {TokenStoreTopic, CorsPermissions, VaultApi} from "../../../types.js"

import {namespace} from "./types.js"

export function setupVaultHost({cors, tokenStore}: {
		cors: CorsPermissions
		tokenStore: TokenStoreTopic
	}) {
	return crosscallHost<VaultApi>({
		namespace,
		exposures: {
			tokenStore: {
				cors,
				exposed: tokenStore,
			}
		}
	})
}
