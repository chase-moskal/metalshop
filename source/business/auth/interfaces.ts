
import {
	User,
	Topic,
	Claims,
	AuthTokens,
	AccessToken,
	RefreshToken,
} from "../../interfaces.js"

export interface UserDraft {
	claims: Claims
	googleId: string
}

export interface UserRecord extends UserDraft {
	userId: string
}

export interface TokenStoreTopic extends Topic<TokenStoreTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
	writeAccessToken(accessToken: AccessToken): Promise<void>
}

export interface UserDatalayer {
	insertRecord(draft: UserDraft): Promise<UserRecord>
	getRecordByUserId(userId: string): Promise<UserRecord>
	getRecordByGoogleId(googleId: string): Promise<UserRecord>
	setRecordClaims(userId: string, claims: Claims): Promise<UserRecord>
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

export interface AuthExchangerTopic extends Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export type VerifyGoogleToken = (googleToken: string) => Promise<GoogleResult>

export interface GoogleResult {
	name: string
	avatar: string
	googleId: string
}
