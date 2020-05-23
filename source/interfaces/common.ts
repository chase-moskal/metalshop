
export interface User {
	userId: string
	claims: Claims
}

export interface BanClaim {
	until: number
	reason: string
}

export interface Claims {
	[key: string]: any
	banned?: BanClaim
	admin?: boolean
	staff?: boolean
	premium?: boolean
	moderator?: boolean
	tags?: string[]
}

export interface Profile {
	userId: string
	joined: number
	nickname: string
	avatar?: string
	tagline?: string
	colors?: {
		alpha: string
		bravo: string
		charlie: string
	}
}

export interface CardClues {
	brand: string
	last4: string
	country: string
	expireYear: number
	expireMonth: number
}

export interface Settings {
	userId: string
	avatar: string
	admin: {
		actAsAdmin: boolean
	}
	billing: {
		premiumSubscription?: {
			card: CardClues
		}
	}
	publicity: {
		avatar: boolean
	}
	premium?: {
		expires: number
	}
}
