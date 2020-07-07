
import {
	Topic,
	Persona,
	BanClaim,
	AccessToken,
} from "../../interfaces.js"

export interface SystemStats {
	userCount: number
	adminCount: number
	staffCount: number
	billingCount: number
}

//
// CONCEPT OF INVITE CODES
//

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

//
// TOPICS AVAILABLE TO FRONTEND
//

export interface SeekerTopic extends Topic<SeekerTopic> {
	search(o: {
			needle: string
			accessToken: AccessToken
		}): Promise<Persona[]>
}

export interface StatisticianTopic extends Topic<StatisticianTopic> {
	fetchStats(o: {
			accessToken: AccessToken
		}): Promise<SystemStats>
}

export interface AdministrativeTopic extends Topic<AdministrativeTopic> {
	invite(o: {
			invite: Invite
			accessToken: AccessToken
		}): Promise<InviteCode>
	redeem(o: {
			inviteCode: InviteCode
			accessToken: AccessToken
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
			moderator: boolean
			accessToken: AccessToken
		}): Promise<void>
	assignTags(o: {
			userId: string
			tags: string[]
			accessToken: AccessToken
		}): Promise<void>
	assignBanishment(o: {
			userId: string
			banishment: BanClaim
			accessToken: AccessToken
		}): Promise<void>
	castPremiumAward(o: {
			days: number
			userId: string
			accessToken: AccessToken
		}): Promise<void>
}
