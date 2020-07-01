
import {
	Topic,
	Persona,
	Profile,
	BanClaim,
	UserRecord,
	AccessToken,
} from "../../interfaces.js"

// import {DbbyTable} from "../../toolbox/dbby/types.js"

// export type UserTable = DbbyTable<UserRecord>
// export type ProfileTable = DbbyTable<Profile>

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

export interface AdminSearchTopic {
	search(o: {
			needle: string
			accessToken: AccessToken
		}): Promise<Persona[]>
}

export interface AdminControlTopic extends Topic<AdminControlTopic> {
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
			banishment: BanClaim
		}): Promise<void>
	castPremiumAward(o: {
			days: number
			userId: string
			accessToken: AccessToken
		}): Promise<void>
}
