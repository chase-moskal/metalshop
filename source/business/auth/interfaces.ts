
import {
	User,
	Topic,
	Claims,
	AuthTokens,
	AccessToken,
	RefreshToken,
	BanishmentClaim,
} from "../../interfaces.js"

export interface UserRecord {
	claims: Claims
	userId: string
	googleId: string
}

export interface TokenStoreTopic extends Topic<TokenStoreTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
	writeAccessToken(accessToken: AccessToken): Promise<void>
}

export interface UserDatalayer {
	insertRecord(record: UserRecord): Promise<void>
	getRecordByUserId(userId: string): Promise<UserRecord>
	getRecordByGoogleId(googleId: string): Promise<UserRecord>
	setRecordClaims(userId: string, claims: Claims): Promise<UserRecord>
}

export interface AuthDealerTopic extends Topic<AuthDealerTopic> {
	getUser(o: {userId: string}): Promise<User>
}

export interface AuthVanguardTopic
 extends AuthDealerTopic {
	createUser(o: {userId: string; googleId: string; claims: Claims}): Promise<User>
	setClaims(o: {userId: string, claims: Claims}): Promise<User>
}

export interface AuthCommon {
	authDealer: AuthDealerTopic
	authVanguard: AuthVanguardTopic
}

export interface AuthExchangerTopic extends Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}

export type InviteCode = string
export interface InviteBase {
	type: string
}
export interface AdminInvite extends InviteBase { type: "admin" }
export interface StaffInvite extends InviteBase { type: "staff" }
export interface ModeratorInvite extends InviteBase { type: "moderator" }
export interface PremiumInvite extends InviteBase {
	type: "premium"
	days: number
}
export interface TagInvite extends InviteBase {
	type: "tag"
	tag: string
}
export type Invite = AdminInvite | StaffInvite | ModeratorInvite
	| PremiumInvite | TagInvite

export interface AuthAdministrationTopic extends Topic<AuthAdministrationTopic> {
	invite(o: {
			accessToken: AccessToken
			invite: Invite
		}): Promise<InviteCode>
	redeem(o: {
			accessToken: AccessToken
			inviteCode: InviteCode
		}): Promise<void>
	assignAdmin(o: {
			userId: string
			admin: boolean
			accessToken: AccessToken
		}): Promise<void>
	assignStaff(o: {
			userId: string
			staff: boolean
			accessToken: AccessToken
		}): Promise<void>
	assignModerator(o: {
			userId: string
			staff: boolean
			accessToken: AccessToken
		}): Promise<void>
	assignTags(o: {
			userId: string
			tags: string[]
			accessToken: AccessToken
		}): Promise<void>
	assignBanishment(o: {
			userId: string
			accessToken: AccessToken
			banishment: BanishmentClaim
		}): Promise<void>
	castPremiumAward(o: {
			days: number
			userId: string
			accessToken: AccessToken
		}): Promise<void>
}

export type VerifyGoogleToken = (googleToken: string) => Promise<GoogleResult>

export interface GoogleResult {
	name: string
	avatar: string
	googleId: string
}
