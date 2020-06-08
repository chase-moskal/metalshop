
import {AdminSearchTopic, Persona} from "../../../interfaces.js"

const mockResult: Persona[] = [
	{
		user: {userId: "u123", claims: {}},
		profile: {
			userId: "u123",
			joined: Date.now(),
			nickname: "Steve Stevenson",
			tagline: "for freedom",
			avatar: null,
			colors: null,
		}
	}
]

export function mockAdminSearch(): AdminSearchTopic {
	return {
		async search({accessToken, needle}) {
			return needle
				? mockResult
				: []
		}
	}
}
