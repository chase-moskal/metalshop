
export interface User {
	userId: string
	claims: Claims
	profile: Profile
}

export interface Claims {
	joined: number
	admin: boolean
	staff: boolean
	moderator: boolean
	premiumUntil: number
	banUntil: number
	banReason: string
	tags: string[]
}

export interface Profile {
	nickname: string
	tagline: string
	avatarPublicity: boolean
	colors: string
	avatar: string
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
