
import {LiveshowApi} from "../../types.js"
import {apiClient} from "renraku/dist/api-client.js"
import {liveshowShape} from "../../types/shapes.js"

export async function makeLiveshowClients({liveshowServerOrigin}: {
		liveshowServerOrigin: string
	}) {
	return await apiClient<LiveshowApi>({
		shape: liveshowShape,
		url: `${liveshowServerOrigin}/api`,
	})
}
