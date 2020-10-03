
import {LiveshowApi} from "./liveshow-types.js"
import {apiClient} from "renraku/dist/api-client.js"

export const makeLiveshowClients = async(origin: string) =>
	await apiClient<LiveshowApi>({
		url: `${origin}/api`,
		shape: {
			liveshowTopic: {
				getShow: "method",
				setShow: "method",
			},
		},
	})
