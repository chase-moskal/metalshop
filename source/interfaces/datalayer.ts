
import {
	User,
	Profile,
	Settings,
	ScheduleEvent,
} from "./common.js"

import {DbbyTable} from "../toolbox/dbby/types.js"

export interface ProfileRecord extends Profile {}
export interface SettingsRecord extends Settings {}

export interface UserRecord extends User {
	googleId: string
}

export interface QuestionRecord {
	time: number
	board: string
	content: string
	archive: boolean
	questionId: string
	authorUserId: string
	likes: {userId: string}[]
}

export interface BillingRecord {
	userId: string
	stripeCustomerId: string
	premiumStripeSubscriptionId?: string
}

export interface LiveshowRecord {
	vimeoId: string
	videoName: string
}

export interface ScheduleRecord extends ScheduleEvent {}

export type UserTable = DbbyTable<UserRecord>
export type ProfileTable = DbbyTable<ProfileRecord>
export type QuestionTable = DbbyTable<QuestionRecord>
export type BillingTable = DbbyTable<BillingRecord>
export type LiveshowTable = DbbyTable<LiveshowRecord>
export type SettingsTable = DbbyTable<SettingsRecord>
export type ScheduleTable = DbbyTable<ScheduleRecord>
