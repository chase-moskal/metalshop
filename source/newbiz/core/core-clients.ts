
import {User, CoreSystemsApi} from "../../types.js"
import {apiClient} from "renraku/dist/api-client.js"
import {makeCoreSystemsApiShape} from "../../shapes.js"

export async function makeCoreSystemsClients<U extends User>({coreServerOrigin}: {
		coreServerOrigin: string
	}) {
	return await apiClient<CoreSystemsApi<U>>({
		shape: makeCoreSystemsApiShape<U>(),
		url: `${coreServerOrigin}/api`,
	})
}
