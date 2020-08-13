
import {LiveshowApi} from "../../types.js"
import {liveshowShape} from "../../types/shapes.js"
import {apiClient} from "renraku/dist/api-client.js"

export async function makeLiveshowClients({liveshowServerOrigin}: {
		liveshowServerOrigin: string
	}) {
	return await apiClient<LiveshowApi>({
		shape: liveshowShape,
		url: `${liveshowServerOrigin}/api`,
	})
}
