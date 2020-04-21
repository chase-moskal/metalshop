
export {CorsPermissions} from "renraku/dist/interfaces.js"

export interface JsonRegex {
	pattern: string
	flags: string
}

export interface CorsConfig {
	allowed: JsonRegex
	forbidden?: JsonRegex
}

export interface MongoConfig {
	link: string
	database: string
}

export interface CommonConfig {
	mongo: MongoConfig
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

export interface QuestionsServerConfig extends CommonConfig {
	questionsServer: {
		port: number
		authServerOrigin: string
		profileServerOrigin: string
	}
}

export interface PaywallServerConfig extends CommonConfig {
	paywallServer: {
		port: number
		stripeApiKey: string
		stripeSecret: string
		stripeWebhooksSecret: string
	}
}
