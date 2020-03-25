
import {
	User,
	Topic,
	Claims,
} from "../../interfaces.js"

export interface UserDraft {
	claims: Claims
	googleId: string
}

export interface UserRecord extends UserDraft {
	userId: string
}

export interface UsersData {
	insertRecord(draft: UserDraft): Promise<UserRecord>
	getRecordByUserId(userId: string): Promise<UserRecord>
	getRecordByGoogleId(googleId: string): Promise<UserRecord>
	setRecordClaims(userId: string, claims: Claims): Promise<UserRecord>
}

export interface AuthCommonOptions {
	usersData: UsersData
}

export interface AuthDealerTopic extends Topic<AuthDealerTopic> {
	getUser(o: {userId: string}): Promise<User>
}

export interface AuthVanguardTopic
 extends AuthDealerTopic {
	createUser(o: {googleId: string}): Promise<User>
	setClaims(o: {userId: string, claims?: Claims}): Promise<User>
}

export interface AuthCommon {
	authDealer: AuthDealerTopic
	authVanguard: AuthVanguardTopic
}
