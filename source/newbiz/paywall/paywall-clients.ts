
import {PaywallApi} from "../../types.js"
import {paywallShape} from "../../shapes.js"
import {apiClient} from "renraku/dist/api-client.js"

export async function makePaywallClients({paywallServerOrigin}: {
		paywallServerOrigin: string
	}) {
	return await apiClient<PaywallApi>({
		shape: paywallShape,
		url: `${paywallServerOrigin}/api`,
	})
}
