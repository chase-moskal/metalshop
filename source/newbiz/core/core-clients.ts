
import {User, CoreSystemsApi} from "../../types.js"
import {apiClient} from "renraku/dist/api-client.js"
import {coreSystemsShape} from "../../shapes.js"

export async function makeCoreSystemsClients<U extends User>({coreServerOrigin}: {
		coreServerOrigin: string
	}) {
	return await apiClient<CoreSystemsApi<U>>({
		shape: coreSystemsShape,
		url: `${coreServerOrigin}/api`,
	})
}
