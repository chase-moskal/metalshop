
import {apiClient} from "renraku/dist/api-client.js"

import {ScheduleApi} from "../../types.js"
import {scheduleShape} from "../../types/shapes.js"

export async function makeScheduleClients({scheduleServerOrigin}: {
		scheduleServerOrigin: string
	}) {
	return await apiClient<ScheduleApi>({
		shape: scheduleShape,
		url: `${scheduleServerOrigin}/api`,
	})
}
