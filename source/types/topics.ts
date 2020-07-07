
import {Topic} from "renraku/dist/interfaces.js"
import {RefreshToken, AccessToken, AuthTokens} from "../interfaces.js"

import {
	User,
	Profile,
	Question,
	QuestionDraft,
	ScheduleEvent,
} from "./common.js"

export interface AuthAardvarkTopic extends Topic<AuthAardvarkTopic> {
	authorize(o: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(o: {googleToken: string}): Promise<AuthTokens>
}

export interface UserUmbrellaTopic extends Topic<UserUmbrellaTopic> {
	getUser(o: {
			userId: string
			accessToken?: AccessToken
		}): Promise<User>
	setProfile(o: {
			userId: string
			profile: Profile
			accessToken: AccessToken
		}): Promise<User>
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

export interface LiveshowListerTopic extends Topic<LiveshowListerTopic> {
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
