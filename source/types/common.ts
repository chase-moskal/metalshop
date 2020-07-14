
import {DbbyValue} from "../toolbox/dbby/types.js"

export interface User<C extends Claims = Claims, P extends Profile = Profile> {
	userId: string
	claims: C
	profile: P
}

export interface Claims {
	[key: string]: DbbyValue
	admin: boolean
	staff: boolean
	banUntil: number
	banReason: string
	joined: number
	lastLogin: number
}

export interface Profile {
	[key: string]: DbbyValue
	nickname: string
	tagline: string
	avatar: string
}

export interface Settings {
	[key: string]: DbbyValue
	actAsAdmin: boolean
	googleName: string
	googleAvatar: string
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
