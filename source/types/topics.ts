
import {Topic} from "renraku/dist/interfaces.js"

import {
	User,
	Scope,
	Question,
	AuthTokens,
	AccessToken,
	PremiumInfo,
	RefreshToken,
	MetalSettings,
	QuestionDraft,
	ScheduleEvent,
} from "../types.js"

export {Topic}

export interface AuthAardvarkTopic extends Topic {
	authorize<S extends Scope = Scope>(o: {
			scope: S
			refreshToken: RefreshToken
		}): Promise<AccessToken>
	authenticateViaGoogle(o: {
			googleToken: string
		}): Promise<AuthTokens>
}

export interface UserUmbrellaTopic<U extends User> extends Topic {
	getUser(o: {
			userId: string
		}): Promise<U>
	setProfile(o: {
			userId: string
			profile: U["profile"]
			accessToken: AccessToken
		}): Promise<void>
}

export interface ClaimsCardinalTopic<U extends User> extends Topic {
	writeClaims(o: {
			userId: string
			claims: Partial<U["claims"]>
		}): Promise<void>
}

export interface PremiumPachydermTopic extends Topic {
	getPremiumDetails(o: {
			accessToken: AccessToken
		}): Promise<PremiumInfo>
	checkoutPremium(o: {
			popupUrl: string
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	updatePremium(o: {
			popupUrl: string
			accessToken: string
		}): Promise<{stripeSessionId: string}>
	cancelPremium(o: {
			accessToken: string
		}): Promise<void>
}

export interface QuestionQuarryTopic extends Topic {
	fetchQuestions(o: {
			board: string
			accessToken?: AccessToken
		}): Promise<Question[]>
	postQuestion(o: {
			draft: QuestionDraft
			accessToken: AccessToken
		}): Promise<Question>
	archiveQuestion(o: {
			questionId: string
			accessToken: AccessToken
		}): Promise<void>
	likeQuestion(o: {
			like: boolean
			questionId: string
			accessToken: AccessToken
		}): Promise<Question>
	archiveBoard(o: {
			board: string
			accessToken: AccessToken
		}): Promise<void>
}

export interface ScheduleSentryTopic extends Topic {
	getEvent(options: {
			label: string
		}): Promise<ScheduleEvent>
	setEvent(options: {
			event: ScheduleEvent
			accessToken: AccessToken
		}): Promise<void>
}

export interface SettingsSheriffTopic<S extends MetalSettings> extends Topic {
	fetchSettings(options: {
			accessToken: AccessToken
		}): Promise<S>
	setActAsAdmin(options: {
			actAsAdmin: boolean
			accessToken: AccessToken
		}): Promise<S>
}

//
// CROSSCALL TOPICS
//

export interface TokenStoreTopic extends Topic {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
	writeAccessToken(accessToken: AccessToken): Promise<void>
}

export interface AccountPopupTopic extends Topic {
	login(): Promise<AuthTokens>
}
