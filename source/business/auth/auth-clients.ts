
import {User, AuthSystemsApi} from "../../types.js"
import {apiClient} from "renraku/dist/api-client.js"
import {authSystemsShape} from "../../types/shapes.js"

export async function makeAuthClients<U extends User>({authServerOrigin}: {
		authServerOrigin: string
	}) {
	return await apiClient<AuthSystemsApi<U>>({
		shape: authSystemsShape,
		url: `${authServerOrigin}/api`,
	})
}
