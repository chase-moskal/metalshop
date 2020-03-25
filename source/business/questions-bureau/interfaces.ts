
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

export interface QuestionRecord {
	time: number
	board: string
	content: string
	archive: boolean
	questionId: string
	authorUserId: string
	likes: {userId: string}[]
}

export interface QuestionsData {
	fetchRecords(board: string): Promise<QuestionRecord[]>

	getRecordById(
		questionId: string
	): Promise<QuestionRecord>

	saveRecord(
		record: QuestionRecord
	): Promise<void>

	likeRecord(options: {
		like: boolean
		userId: string
		questionId: string
	}): Promise<QuestionRecord>

	trashRecord(
		questionId: string
	): Promise<void>
}

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
