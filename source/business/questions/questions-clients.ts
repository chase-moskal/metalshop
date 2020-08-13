
import {apiClient} from "renraku/dist/api-client.js"

import {QuestionsApi} from "../../types.js"
import {questionsShape} from "../../types/shapes.js"

export async function makeQuestionsClients({questionsServerOrigin}: {
		questionsServerOrigin: string
	}) {
	return await apiClient<QuestionsApi>({
		shape: questionsShape,
		url: `${questionsServerOrigin}/api`,
	})
}
