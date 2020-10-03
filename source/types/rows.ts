
import {MetalClaims, MetalProfile, MetalSettings, CardClues} from "../types.js"

export interface AccountRow {
	userId: string
	googleId: string
	googleAvatar: string
}

export interface ClaimsRow extends MetalClaims {
	userId: string
}

export interface ProfileRow extends MetalProfile {
	userId: string
}

export interface SettingsRow extends MetalSettings {
	userId: string
	actAsAdmin: boolean
}


export interface StripeBillingRow {
	userId: string
	stripeCustomerId: string
}

export interface StripePremiumRow extends CardClues {
	userId: string
	stripeSubscriptionId: string
}

export interface PremiumGiftRow {
	userId: string
	until: number
}

export interface QuestionRow {
	questionId: string
	authorUserId: string
	board: string
	content: string
	archive: boolean
	timePosted: number
}

export interface QuestionLikeRow {
	userId: string
	questionId: string
}

export interface QuestionReportRow {
	userId: string
	questionId: string
}

export interface LiveshowRow {
	label: string
	vimeoId: string
}

export interface ScheduleEventRow {
	label: string
	time: number
}
