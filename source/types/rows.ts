
import {DbbyRow, DbbyValue} from "../toolbox/dbby/types.js"

export interface AccountRow extends DbbyRow<AccountRow> {
	userId: string
	name: string
	googleId: string
	lastLogin: number
	joined: number
}

export interface ClaimRow extends DbbyRow<ClaimRow> {
	userId: string
	admin: boolean
	staff: boolean
	banUntil: number
	banReason: string
	[key: string]: DbbyValue
}

export interface ProfileRow extends DbbyRow<ProfileRow> {
	userId: string
	nickname: string
	tagline: string
	avatar: string
	avatarPublicity: boolean
	[key: string]: DbbyValue
}

const lol: ProfileRow = {
	userId: "string",
	nickname: "string",
	tagline: "string",
	avatar: "string",
	avatarPublicity: true,
}

export interface BillingRow extends DbbyRow<BillingRow> {
	userId: string
	stripeCustomerId: string
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
