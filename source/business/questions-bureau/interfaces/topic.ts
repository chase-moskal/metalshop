
import {AccessToken} from "../../../interfaces/tokens.js"
import {Question, QuestionDraft} from "./questions.js"

export interface QuestionsBureauTopic {

	fetchQuestions(o: {
		board: string
	}): Promise<Question[]>

	postQuestion(o: {
		draft: QuestionDraft
		accessToken: AccessToken
	}): Promise<Question>

	deleteQuestion(o: {
		questionId: string
		accessToken: AccessToken
	}): Promise<void>

	likeQuestion(o: {
		like: boolean
		questionId: string
		accessToken: AccessToken
	}): Promise<Question>
}
