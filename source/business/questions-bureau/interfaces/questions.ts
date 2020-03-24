
import {User, Profile} from "../../../interfaces/common.js"

export interface QuestionAuthor {
	user: User
	profile: Profile
}

export interface LikeInfo {
	liked: boolean
	likes: number
}

export interface QuestionValidation {
	angry: boolean
	message: string
	postable: boolean
}

export interface QuestionDraft {
	time: number
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	likeInfo: LikeInfo
	author: QuestionAuthor
}

export interface QuestionsState {
	user: User
	profile: Profile
	boards: {
		[boardName: string]: {
			questions: Question[]
		}
	}
}
