
import {namespace} from "./common.js"
import {TokenStoreTopic} from "../../../types.js"
import {crosscallHost} from "crosscall/dist/crosscall-host.js"
import {CorsPermissions, VaultApi} from "../../../types.js"

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
