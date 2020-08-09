
import {DbbyValue} from "../toolbox/dbby/dbby-types.js"

//
// bare-bones unopinionated agnostic basics
//

export interface User {
	userId: string
	claims: Claims
	profile: Profile
}

export interface Claims {
	[key: string]: DbbyValue
}

export interface Profile {
	[key: string]: DbbyValue
}

export interface Settings {
	[key: string]: DbbyValue
}

//
// standard metalshop configuration
//

export interface MetalGenerics {
	user: MetalUser
	settings: MetalSettings
}

export interface MetalClaims extends Claims {
	admin: boolean
	staff: boolean
	banUntil: number
	banReason: string
	joined: number
	premiumUntil: number
}

export interface MetalProfile extends Profile {
	nickname: string
	tagline: string
	avatar: string
}

export interface MetalUser extends User {
	claims: MetalClaims
	profile: MetalProfile
}

export interface MetalSettings extends Settings {
	actAsAdmin: boolean
}
