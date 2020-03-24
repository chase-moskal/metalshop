
export {CorsPermissions} from "renraku/dist/interfaces.js"

export interface JsonRegex {
	pattern: string
	flags: string
}

export interface CorsConfig {
	allowed: JsonRegex
	forbidden?: JsonRegex
}

export interface CommonConfig {
	mongo: {
		link: string
		database: string
	}
	cors: CorsConfig
}

export interface AuthServerConfig extends CommonConfig {
	authServer: {
		port: number
		debug: boolean
		googleClientId: string
		profileServerOrigin: string
	}
}

export interface ProfileServerConfig extends CommonConfig {
	profileServer: {
		port: number
	}
}
