
import {User} from "../types.js"

export interface QuestionDraft {
	board: string
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	author: User
	liked: boolean
	likes: number
	reports: number
	reported: boolean
	timePosted: number
}

export interface ScheduleEvent {
	label: string
	time: number
}
