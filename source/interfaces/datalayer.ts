
import {
	User,
	Profile,
} from "./common.js"

import {DbbyTable} from "../toolbox/dbby/types.js"

export interface ProfileRecord extends Profile {}

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

export type UserTable = DbbyTable<UserRecord>
export type ProfileTable = DbbyTable<ProfileRecord>
export type QuestionTable = DbbyTable<QuestionRecord>
export type BillingTable = DbbyTable<BillingRecord>
