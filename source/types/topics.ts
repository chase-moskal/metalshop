
import {Topic} from "renraku/dist/interfaces.js"
import {RefreshToken, AccessToken, AuthTokens} from "../interfaces.js"

import {
	User,
	Scope,
	Claims,
	Profile,
	Question,
	QuestionDraft,
	ScheduleEvent,
} from "../types.js"

export interface AuthAardvarkTopic extends Topic<AuthAardvarkTopic> {
	authorize<S extends Scope = Scope>(o: {
			scope: S
			refreshToken: RefreshToken
		}): Promise<AccessToken>
	authenticateViaGoogle(o: {googleToken: string}): Promise<AuthTokens>
}

export interface UserUmbrellaTopic<U extends User> extends Topic<UserUmbrellaTopic<U>> {
	getUser(o: {userId: string}): Promise<U>
	setProfile(o: {
			userId: string
			profile: U["profile"]
			accessToken: AccessToken
		}): Promise<void>
}

export interface ClaimsCardinalTopic<U extends User> extends Topic<ClaimsCardinalTopic<U>> {
	setClaims(o: {
			userId: string
			claims: U["claims"]
		}): Promise<void>
}

export interface PaywallPachydermTopic extends Topic<PaywallPachydermTopic> {
	checkoutPremium(o: {
			popupUrl: string
			accessToken: AccessToken
		}): Promise<{stripeSessionId: string}>
	updatePremium(o: {
			popupUrl: string
			accessToken: string
		}): Promise<void>
	cancelPremium(o: {
			accessToken: string
		}): Promise<void>
}

export interface QuestionQuarryTopic extends Topic<QuestionQuarryTopic> {
	fetchQuestions(o: {
			board: string
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

export interface LiveshowLizardTopic extends Topic<LiveshowLizardTopic> {
	getShow(o: {
			accessToken: AccessToken
			videoName: string
		}): Promise<{vimeoId: string}>
	setShow(o: {
			accessToken: AccessToken
			videoName: string
			vimeoId: string
		}): Promise<void>
}

export interface ScheduleSentryTopic extends Topic<ScheduleSentryTopic> {
	getEvent(options: {
			name: string
		}): Promise<ScheduleEvent>
	setEvent(options: {
			event: ScheduleEvent
			accessToken: AccessToken
		}): Promise<void>
}

//
// CROSSCALL TOPICS
//

export interface TokenStoreTopic extends Topic<TokenStoreTopic> {
	clearTokens(): Promise<void>
	passiveCheck(): Promise<AccessToken>
	writeTokens(token: AuthTokens): Promise<void>
	writeAccessToken(accessToken: AccessToken): Promise<void>
}

export interface AccountPopupTopic extends Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}
