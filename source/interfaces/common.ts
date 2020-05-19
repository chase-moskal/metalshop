
export interface User {
	userId: string
	claims: Claims
}

export interface Claims {
	[key: string]: any
	admin?: boolean
	staff?: boolean
	premium?: boolean
	moderator?: boolean
}

export interface Profile {
	userId: string
	avatar?: string
	nickname: string
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
