
export interface User {
	userId: string
	claims: Claims
}

export interface Claims {
	[key: string]: any
	stripe?: StripeClaim
	premium?: PremiumClaim
}

export interface StripeClaim {
	customerId: string
}

export interface PremiumClaim {
	expires: number
	autoRenew: boolean
	stripeSubscriptionId: string
}

export interface Profile {
	userId: string
	avatar: string
	nickname: string
	adminMode: boolean
}
