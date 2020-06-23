
import {apiClient} from "renraku/dist/api-client.js"
import {authShape} from "authoritarian/dist/shapes.js"
import {AuthApi} from "authoritarian/dist/interfaces.js"
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {TokenStore} from "authoritarian/dist/business/auth/vault-iframe/token-store.js"
import {createVaultHost} from "authoritarian/dist/business/auth/vault-iframe/vault-host.js"

import {VaultSettings} from "./interfaces.js"

~async function main() {
	const {authExchanger} = await apiClient<AuthApi>({
		url: `${window.location.origin}/api`,
		shape: authShape
	})
	const settings: VaultSettings = window.settings
	const cors = unpackCorsConfig(settings.cors)
	const tokenStore = new TokenStore({
		authExchanger,
		storage: window.localStorage,
	})
	createVaultHost({cors, tokenStore})
}()
	.then(() => console.log("🔒 vault script"))
	.catch(error => console.error(error))
