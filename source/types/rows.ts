
import {DbbyRow} from "../toolbox/dbby/dbby-types.js"
import {MetalClaims, MetalProfile, MetalSettings, CardClues} from "../types.js"

export interface AccountRow extends DbbyRow {
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


export interface StripeBillingRow extends DbbyRow {
	userId: string
	stripeCustomerId: string
}

export interface StripePremiumRow extends CardClues {
	userId: string
	stripeSubscriptionId: string
}

export interface PremiumGiftRow extends DbbyRow {
	userId: string
	until: number
}

export interface QuestionRow extends DbbyRow {
	questionId: string
	authorUserId: string
	board: string
	content: string
	archive: boolean
	timePosted: number
}

export interface QuestionLikeRow extends DbbyRow {
	userId: string
	questionId: string
}

export interface QuestionReportRow extends DbbyRow {
	userId: string
	questionId: string
}

export interface LiveshowRow extends DbbyRow {
	label: string
	vimeoId: string
}

export interface ScheduleEventRow extends DbbyRow {
	label: string
	time: number
}
