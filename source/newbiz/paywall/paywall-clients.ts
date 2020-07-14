
import {paywallShape} from "../../shapes.js"
import {PaywallApi} from "../../interfaces.js"
import {apiClient} from "renraku/dist/api-client.js"

export async function makePaywallClients({paywallServerOrigin}: {
		paywallServerOrigin: string
	}) {
	return await apiClient<PaywallApi>({
		shape: paywallShape,
		url: `${paywallServerOrigin}/api`,
	})
}
