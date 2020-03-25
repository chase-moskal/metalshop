
import {apiClient} from "renraku/dist/api-client.js"

import {profileShape} from "../../shapes.js"
import {ProfileApi} from "../../interfaces.js"

export async function makeProfileMagistrateClient({profileServerOrigin}: {
	profileServerOrigin: string
}) {
	const {profileMagistrate} = await apiClient<ProfileApi>({
		url: `${profileServerOrigin}/api`,
		shape: profileShape
	})
	return profileMagistrate
}
