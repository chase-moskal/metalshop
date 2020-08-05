
import {DbbyRow} from "../toolbox/dbby/types.js"
import {MetalClaims, MetalProfile, MetalSettings, CardClues} from "../types.js"

export interface AccountRow extends DbbyRow<AccountRow> {
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


export interface StripeBillingRow extends DbbyRow<StripeBillingRow> {
	userId: string
	stripeCustomerId: string
}

export interface StripePremiumRow extends CardClues {
	userId: string
	stripeSubscriptionId: string
}

export interface PremiumGiftRow extends DbbyRow<PremiumGiftRow> {
	userId: string
	until: number
}

export interface QuestionRow extends DbbyRow<QuestionRow> {
	questionId: string
	authorUserId: string
	board: string
	content: string
	archive: boolean
	timePosted: number
}

export interface QuestionLikeRow extends DbbyRow<QuestionLikeRow> {
	userId: string
	questionId: string
}

export interface QuestionReportRow extends DbbyRow<QuestionReportRow> {
	userId: string
	questionId: string
}

export interface LiveshowRow extends DbbyRow<LiveshowRow> {
	label: string
	vimeoId: string
}

export interface ScheduleEventRow extends DbbyRow<ScheduleEventRow> {
	label: string
	time: number
}
