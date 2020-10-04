
import {AsDbbyRow} from "../../toolbox/dbby/dbby-types.js"

// common stuff
//

export interface User {
	userId: string
	profile: Profile
	privileges: string[]
}

export interface Profile {
	userId: string
	nickname: string
	tagline: string
	avatar: string
}

export interface Settings {
	actAsAdmin: boolean
}

// account rows
//

export type AccountRow = AsDbbyRow<{
	userId: string
	created: number
}>

export type AccountViaGoogleRow = AsDbbyRow<{
	userId: string
	googleId: string
	googleAvatar: string
}>

export type AccountViaPasswordRow = AsDbbyRow<{
	userId: string
	password: string
}>

export type AccountViaSignatureRow = AsDbbyRow<{
	userId: string
	publicKey: string
}>

export type ProfileRow = AsDbbyRow<{
	userId: string
	nickname: string
	tagline: string
	avatar: string
}>

export type SettingsRow = AsDbbyRow<{
	actAsAdmin: boolean
}>

// roles and permissions
//

export type RoleRow = AsDbbyRow<{
	roleId: string
	role: string
}>

export type PrivilegeRow = AsDbbyRow<{
	privilegeId: string
	roleId: string
	privilege: string
}>
