
import {DbbyValue} from "../toolbox/dbby/types.js"

export interface User {
	userId: string
	claims: Claims
	profile: Profile
	details: Details
}

export interface Claims {
	admin: boolean
	staff: boolean
	banUntil: number
	banReason: string
	[key: string]: DbbyValue
}

export interface Details {
	joined: number
}

export interface Profile {
	nickname: string
	tagline: string
	avatar: string
	avatarPublicity: boolean
	[key: string]: DbbyValue
}

//
//
//

export interface QuestionDraft {
	board: string
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	authorUserId: string
	posted: number
	liked: boolean
	likes: number
	reported: boolean
}

export interface ScheduleEvent {
	label: string
	time: number
}
