
import {apiClient} from "renraku/dist/api-client.js"

import {SettingsApi} from "../../types.js"
import {settingsShape} from "../../types/shapes.js"

export async function makeSettingsClients({settingsServerOrigin}: {
		settingsServerOrigin: string
	}) {
	return await apiClient<SettingsApi>({
		shape: settingsShape,
		url: `${settingsServerOrigin}/api`,
	})
}
