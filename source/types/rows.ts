
import {ToDbbyRow} from "../toolbox/dbby/dbby-types.js"
import {MetalClaims, MetalProfile, MetalSettings, CardClues} from "../types.js"

export type AccountRow = {
	userId: string
	googleId: string
	googleAvatar: string
}

export type ClaimsRow = MetalClaims & {
	userId: string
}

export type ProfileRow = MetalProfile & {
	userId: string
}

export type SettingsRow = MetalSettings & {
	userId: string
	actAsAdmin: boolean
}

export type StripeBillingRow = {
	userId: string
	stripeCustomerId: string
}

export type StripePremiumRow = CardClues & {
	userId: string
	stripeSubscriptionId: string
}

export type PremiumGiftRow = {
	userId: string
	until: number
}

export type QuestionRow = {
	questionId: string
	authorUserId: string
	board: string
	content: string
	archive: boolean
	timePosted: number
}

export type QuestionLikeRow = {
	userId: string
	questionId: string
}

export type QuestionReportRow = {
	userId: string
	questionId: string
}

export type ScheduleEventRow = {
	label: string
	time: number
}
