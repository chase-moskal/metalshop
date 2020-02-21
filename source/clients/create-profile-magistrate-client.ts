
import {apiClient} from "renraku/dist/api-client.js"

import {profileShape} from "../shapes.js"
import {ProfileApi} from "../interfaces.js"

export async function createProfileMagistrateClient({authServerOrigin}: {
	authServerOrigin: string
}) {
	const {profileMagistrate} = await apiClient<ProfileApi>({
		url: `${authServerOrigin}/api`,
		shape: profileShape
	})
	return profileMagistrate
}
