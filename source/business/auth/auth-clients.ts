
import {apiClient} from "renraku/dist/api-client.js"

import {authShape} from "../../shapes.js"
import {AuthApi} from "../../interfaces.js"

export async function makeAuthClients({authServerOrigin}: {
		authServerOrigin: string
	}) {
	return apiClient<AuthApi>({
		shape: authShape,
		url: `${authServerOrigin}/api`,
	})
}
