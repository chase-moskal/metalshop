
import {AccessToken} from "../../../interfaces/tokens.js"
import {Question, QuestionDraft} from "./questions.js"

export interface QuestionsBureauTopic {

	fetchQuestions(o: {
		boardName: string
	}): Promise<Question[]>

	postQuestion(o: {
		boardName: string
		draft: QuestionDraft
		accessToken: AccessToken
	}): Promise<Question>

	deleteQuestion(o: {
		boardName: string
		questionId: string
		accessToken: AccessToken
	}): Promise<void>

	likeQuestion(o: {
		like: boolean
		questionId: string
		accessToken: AccessToken
	}): Promise<Question>
}
