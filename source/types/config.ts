
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
	debug: boolean
	cors: CorsConfig
	mongo: MongoConfig
	authServerOrigin: string
}

export type NicknameDictionary = "colors" | "animals" | "adjectives"
export type NicknameStructure = NicknameDictionary[][]

export interface AuthServerConfig extends CommonConfig {
	authServer: {
		port: number
		googleClientId: string
		accessTokenLifespan: number
		refreshTokenLifespan: number
		nicknameStructure: NicknameStructure
	}
}

export interface LiveshowServerConfig extends CommonConfig {
	liveshowServer: {
		port: number
	}
}

export interface QuestionsServerConfig extends CommonConfig {
	questionsServer: {
		port: number
	}
}

export interface ScheduleServerConfig extends CommonConfig {
	scheduleServerConfig: {
		port: number
	}
}


export interface ScheduleServerConfig extends CommonConfig {
	settingsServer: {
		port: number
	}
}

export interface PaywallServerConfig extends CommonConfig {
	paywallServer: {
		port: number
		stripeApiKey: string
		stripeSecret: string
		premiumStripePlanId: string
		stripeWebhooksSecret: string
	}
}
