
import {DbbyRow} from "../toolbox/dbby/types.js"
import {Claims, Profile} from "../types.js"

export interface AccountRow extends DbbyRow<AccountRow> {
	userId: string
	name: string
	googleId: string
}

export interface ClaimsRow extends Claims {
	userId: string
}

export interface ProfileRow extends Profile {
	userId: string
}

export interface StripeBillingRow extends DbbyRow<StripeBillingRow> {
	userId: string
	customerId: string
}

export interface StripePremiumRow extends DbbyRow<StripePremiumRow> {
	userId: string
	subscriptionId: string
	until: number
	brand: string
	last4: string
	country: string
	expireYear: string
	expireMonth: string
}

export interface PremiumGiftRow extends DbbyRow<PremiumGiftRow> {
	userId: string
	until: number
}

export interface QuestionRow extends DbbyRow<QuestionRow> {
	questionId: string
	authorUserId: string
	board: string
	posted: number
	content: string
	archive: boolean
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
