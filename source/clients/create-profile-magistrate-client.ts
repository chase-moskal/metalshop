
import {apiClient} from "renraku/dist/api-client.js"

import {profileShape} from "../shapes.js"
import {ProfileApi} from "../interfaces.js"

export async function createProfileMagistrateClient({url}: {url: string}) {
	const {profileMagistrate} = await apiClient<ProfileApi>({
		url,
		shape: profileShape
	})
	return profileMagistrate
}
