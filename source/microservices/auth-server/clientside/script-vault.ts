
import {MetalUser} from "../../../types.js"
import {makeTokenStore} from "../../../business/auth/token-store.js"
import {unpackCorsConfig} from "../../../toolbox/unpack-cors-config.js"
import {makeAuthClients} from "../../../business/auth/auth-clients.js"
import {setupVaultHost} from "../../../business/auth/vault-popup/setup-vault-host.js"

import {VaultSettings} from "./types.js"

const win: Window & {
	settings: VaultSettings
} = <any>window

~async function main() {
	const {authAardvark} = await makeAuthClients<MetalUser>({
		authServerOrigin: win.location.origin,
	})
	const cors = unpackCorsConfig(win.settings.cors)
	const tokenStore = makeTokenStore({
		authAardvark,
		storage: win.localStorage,
	})
	setupVaultHost({cors, tokenStore})
}()
	.then(() => console.log("🔒 vault script"))
	.catch(error => console.error(error))
