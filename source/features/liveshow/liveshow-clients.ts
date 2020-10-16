
import {LiveshowApi} from "./liveshow-types.js"
import {apiClient} from "renraku/dist/api-client.js"
import {Clientize} from "renraku/dist/types.js"

export const makeLiveshowClients = async(origin: string) =>
	await apiClient<Clientize<LiveshowApi>>({
		url: `${origin}/api`,
		shape: {
			liveshowTopic: {
				getShow: "method",
				setShow: "method",
			},
		},
	})
