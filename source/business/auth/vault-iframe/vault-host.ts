
import {namespace} from "./common.js"
import {TokenStoreTopic} from "./interfaces.js"
import {crosscallHost} from "crosscall/dist/crosscall-host.js"
import {CorsPermissions, VaultApi} from "../../../interfaces.js"

export function createVaultHost({cors, tokenStore}: {
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
