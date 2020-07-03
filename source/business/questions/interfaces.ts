
import {User, Profile, AccessToken} from "../../interfaces.js"

export interface QuestionAuthor {
	user: User
	profile: Profile
}

export interface LikeInfo {
	liked: boolean
	likes: number
}

export interface QuestionDraft {
	time: number
	board: string
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	likeInfo: LikeInfo
	author: QuestionAuthor
}

export interface QuestionsBureauTopic {
	fetchQuestions(o: {
			board: string
		}): Promise<Question[]>
	postQuestion(o: {
			draft: QuestionDraft
			accessToken: AccessToken
		}): Promise<Question>
	archiveQuestion(o: {
			questionId: string
			accessToken: AccessToken
		}): Promise<void>
	likeQuestion(o: {
			like: boolean
			questionId: string
			accessToken: AccessToken
		}): Promise<Question>
	archiveBoard(o: {
			board: string
			accessToken: AccessToken
		}): Promise<void>
}
