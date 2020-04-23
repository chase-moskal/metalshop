
export interface User {
	userId: string
	claims: Claims
}

export interface Claims {
	[key: string]: any
	premium?: PremiumClaim
	billing?: BillingClaim
}

export interface PremiumClaim {
	expires: number
}

export interface BillingClaim {
	linked: boolean
}

export interface Profile {
	userId: string
	avatar: string
	nickname: string
	adminMode: boolean
}
