
export interface AuthPayload {
	user: {
		id: number
		username: string
		email: string
		roles: string[]
	}
}

export interface AuthRouterOptions {
	secretKey: string | Buffer
	tokenExpiresIn: string | number
	getAuthPayload: () => Promise<AuthPayload>
}

export interface AuthServerOptions extends AuthRouterOptions {
	port: number
}
