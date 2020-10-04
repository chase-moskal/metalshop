
import {makeAuthApi} from "./auth-api.js"
import {makeTokenStore} from "./token-store.js"

export type AuthApi = ReturnType<typeof makeAuthApi>
export type TokenStoreTopic = ReturnType<typeof makeTokenStore>

export type AppsTopic = AuthApi["appsTopic"]
export type AuthTopic = AuthApi["authTopic"]
export type UserTopic = AuthApi["userTopic"]

// common stuff
//

export type User = {
	userId: string
	profile: Profile
	privileges: string[]
}

export type Profile = {
	userId: string
	nickname: string
	tagline: string
	avatar: string
}

export type Settings = {
	actAsAdmin: boolean
}

// account rows
//

export type AccountRow = {
	userId: string
	created: number
}

export type AccountViaGoogleRow = {
	userId: string
	googleId: string
	googleAvatar: string
}

export type AccountViaPasskeyRow = {
	userId: string
	digest: string
}

export type AccountViaSignatureRow = {
	userId: string
	publicKey: string
}

export type ProfileRow = {
	userId: string
	nickname: string
	tagline: string
	avatar: string
}

export type SettingsRow = {
	actAsAdmin: boolean
}

// roles and permissions
//

export type RoleRow = {
	roleId: string
	role: string
}

export type PrivilegeRow = {
	privilegeId: string
	roleId: string
	privilege: string
}
