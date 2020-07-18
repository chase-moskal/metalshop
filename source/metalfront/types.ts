
import {CSSResult, CSSResultArray} from "lit-element"

import {
	User,
	Scope,
	Settings,
	Question,
	CardClues,
	AuthTokens,
	AccessToken,
	PaywallUser,
	AccessPayload,
	ScheduleEvent,
	QuestionDraft,
	TokenStoreTopic,
	UserUmbrellaTopic,
	AuthAardvarkTopic,
	ClaimsCardinalTopic,
	ScheduleSentryTopic,
	QuestionQuarryTopic,
	LiveshowLizardTopic,
	SettingsSheriffTopic,
	PremiumPachydermTopic,
} from "../types.js"

import {AuthModel} from "./models/auth-model.js"
import {SeekerModel} from "./models/seeker-model.js"
import {PaywallModel} from "./models/paywall-model.js"
import {ScheduleModel} from "./models/schedule-model.js"
import {PersonalModel} from "./models/personal-model.js"
import {QuestionsModel} from "./models/questions-model.js"
import {LiveshowViewModel, LiveshowModel} from "./models/liveshow-model.js"

import * as loading from "./toolbox/loading.js"
import {Logger} from "../toolbox/logger/interfaces.js"

////////////////////////

export interface MetalConfig {
	["mock"]: string
	["mock-avatar"]: string
	["auth-server"]: string
	["profile-server"]: string
	["paywall-server"]: string
	["schedule-server"]: string
	["liveshow-server"]: string
	["questions-server"]: string
}

export type CSS = CSSResult | CSSResultArray
export type ConstructorFor<T extends {} = {}> = new(...args: any[]) => T

export interface Personal<U extends User, S extends Settings> {
	user: U
	settings: S
}

export interface MetalOptions<U extends User> {
	logger: Logger
	authAardvark: AuthAardvarkTopic
	tokenStore: TokenStoreTopic
	userUmbrella: UserUmbrellaTopic<U>
	liveshowLizard: LiveshowLizardTopic
	scheduleSentry: ScheduleSentryTopic
	questionQuarry: QuestionQuarryTopic
	settingsSheriff: SettingsSheriffTopic
	premiumPachyderm: PremiumPachydermTopic
	//—
	checkoutPopupUrl: string
	decodeAccessToken: DecodeAccessToken<U>
	triggerAccountPopup: TriggerAccountPopup
	triggerCheckoutPopup: TriggerCheckoutPopup
}

export interface AuthContext<U extends User> {
	user: U
	exp: number
	accessToken: AccessToken
}

export type GetAuthContext<U extends User> = () => Promise<AuthContext<U>>
export type DecodeAccessToken<U extends User> = (accessToken: AccessToken) => AuthContext<U>

export type TriggerAccountPopup = () => Promise<AuthTokens>
export type TriggerCheckoutPopup = (o: {stripeSessionId: string}) => Promise<void>

export interface LoginWithAccessToken {
	(accessToken: AccessToken): Promise<void>
}

export interface AuthPayload<U extends User> {
	user: U
	getAuthContext: GetAuthContext<U>
}

export interface QuestionValidation {
	angry: boolean
	message: string
	postable: boolean
}

export interface QuestionsBureauUi {
	fetchQuestions(o: {
			board: string
		}): Promise<Question[]>
	postQuestion(o: {
			draft: QuestionDraft
		}): Promise<Question>
	deleteQuestion(o: {
			questionId: string
		}): Promise<void>
	likeQuestion(o: {
			like: boolean
			questionId: string
		}): Promise<Question>
	purgeQuestions(o: {
			board: string
		}): Promise<void>
}

export interface VideoPayload {
	vimeoId: string
}

export type PrepareHandleLikeClick = (o: {
	like: boolean
	questionId: string
}) => (event: MouseEvent) => void

//
// supermodel
//

export interface Supermodel {
	auth: AuthModel
	paywall: PaywallModel
	personal: PersonalModel
	schedule: ScheduleModel
	liveshow: LiveshowModel
	questions: QuestionsModel
	// seeker: SeekerModel
}

export enum ProfileMode {
	Error,
	Loading,
	Loaded,
	None,
}

export enum BillingPremiumSubscription {
	Unsubscribed,
	Subscribed,
}

export enum PremiumStatus {
	NotPremium,
	Premium,
}

export enum PrivilegeLevel {
	Unknown,
	Unprivileged,
	Privileged,
}

//
// component shares
//

export interface SettingsPremiumSubscription {
	card: CardClues
}

export interface AccountShare<U extends User> {
	login: () => Promise<void>
	logout: () => Promise<void>
	authLoad: loading.Load<AuthPayload<U>>
}

export interface MyAvatarShare<U extends User> {
	personalLoad: loading.Load<Personal<U>>
}

export interface ButtonPremiumShare<U extends User> {
	personalLoad: loading.Load<Personal<U>>
	premiumClaim: boolean
	premiumSubscription: SettingsPremiumSubscription
	login(): Promise<void>
	checkoutPremium(): Promise<void>
}

export interface AdminModeShare<U extends User> {
	personalLoad: loading.Load<Personal<U>>
	setAdminMode(adminMode: boolean): Promise<void>
}

export interface AdminOnlyShare<U extends User> {
	personalLoad: loading.Load<Personal<U>>
}

export interface PersonalShare<U extends User> {
	personal: Personal<U>
	personalLoad: loading.Load<Personal<U>>
	saveProfile(profile: U["profile"]): Promise<void>
	setAdminMode(adminMode: boolean): Promise<void>
	setAvatarPublicity(avatarPublicity: boolean): Promise<void>
}

export interface PaywallShare<U extends User> {
	personalLoad: loading.Load<Personal<U>>
	premiumClaim: boolean
	premiumExpires: number
	premiumSubscription: SettingsPremiumSubscription
	checkoutPremium(): Promise<void>
	updatePremium(): Promise<void>
	cancelPremium(): Promise<void>
}

export interface QuestionsShare<U extends User> {
	user: U
	uiBureau: QuestionsBureauUi
	fetchCachedQuestions(board: string): Question[]
}

export interface CountdownShare<U extends User> {
	events: ScheduleEvent[]
	authLoad: loading.Load<AuthPayload<U>>
	loadEvent: (name: string) => Promise<ScheduleEvent>
	saveEvent: (event: ScheduleEvent) => Promise<void>
}

export interface LiveshowShare<U extends User> {
	authLoad: loading.Load<AuthPayload<U>>
	makeViewModel(options: {videoName: string}): {
		dispose: () => void
		viewModel: LiveshowViewModel
	}
}

// export interface SeekerShare {
// 	resultsLoad: loading.Load<Persona[]>
// 	query: (needle: string) => Promise<void>
// }
