
import {User, Profile} from "../../../interfaces/common.js"

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
