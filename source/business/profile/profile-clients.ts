
import {profileShape} from "../../shapes.js"
import {ProfileApi} from "../../interfaces.js"
import {apiClient} from "renraku/dist/api-client.js"

export async function makeProfileClients({profileServerOrigin}: {
		profileServerOrigin: string
	}) {
	return await apiClient<ProfileApi>({
		shape: profileShape,
		url: `${profileServerOrigin}/api`,
	})
}
