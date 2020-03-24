
export interface Claims {
	[key: string]: any
}

export interface User {
	userId: string
	claims: Claims
}

export interface Profile {
	userId: string
	avatar: string
	nickname: string
	adminMode: boolean
}
