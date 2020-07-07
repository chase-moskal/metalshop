
export interface Claims {
	admin: boolean
	staff: boolean
	premium: boolean
	moderator: boolean
	banned: boolean
}

export interface Profile {
	nickname: string
	tagline: string
	tags: string[]
	avatarPublicity: boolean
	colors?: string
	avatar?: string
}

export interface Details {
	banReason?: string
	premiumUntil?: number
}

export interface User {
	userId: string
	claims: Claims
	profile: Profile
	details: Details
}

export interface QuestionDraft {
	board: string
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	authorUserId: string
	liked: boolean
	likes: number
	posted: number
}

export interface ScheduleEvent {
	label: string
	time: number
}
