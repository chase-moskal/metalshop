
import {Api as RenrakuApi} from "renraku/dist/interfaces.js"
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"

import {
	User,

	AuthAardvarkTopic,
	UserUmbrellaTopic,
	ClaimsCardinalTopic,
	QuestionQuarryTopic,
	LiveshowLizardTopic,
	ScheduleSentryTopic,
	PaywallPachydermTopic,

	TokenStoreTopic,
	AccountPopupTopic,
} from "../types.js"

//
// RENRAKU
//

export interface CoreApi<U extends User> extends RenrakuApi<CoreApi<U>> {
	authAardvark: AuthAardvarkTopic
	userUmbrella: UserUmbrellaTopic<U>
	claimsCardinal: ClaimsCardinalTopic<U>
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallPachyderm: PaywallPachydermTopic
}

export interface QuestionsApi extends RenrakuApi<QuestionsApi> {
	questionQuarry: QuestionQuarryTopic
}

export interface LiveshowApi extends RenrakuApi<LiveshowApi> {
	liveshowLizard: LiveshowLizardTopic
}

export interface ScheduleApi extends RenrakuApi<ScheduleApi> {
	scheduleSentry: ScheduleSentryTopic
}

//
// CROSSCALL
//

export interface VaultApi extends CrosscallApi<VaultApi> {
	tokenStore: TokenStoreTopic
}

export interface AccountPopupApi extends CrosscallApi<AccountPopupApi> {
	accountPopup: AccountPopupTopic
}
