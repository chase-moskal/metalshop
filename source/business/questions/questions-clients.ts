
import {questionsShape} from "../../shapes.js"
import {QuestionsApi} from "../../interfaces.js"
import {apiClient} from "renraku/dist/api-client.js"

export const makeQuestionsClients = ({questionsServerOrigin}: {
	questionsServerOrigin: string
}) => apiClient<QuestionsApi>({
	shape: questionsShape,
	url: `${questionsServerOrigin}/api`
})
