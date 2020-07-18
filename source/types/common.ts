
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
}

//
//
//

export interface PaywallClaims extends Claims {
	premiumUntil: number
}

export type PaywallUser = User<PaywallClaims, Profile>

//
//
//

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
