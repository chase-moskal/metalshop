
import {Api as RenrakuApi} from "renraku/dist/interfaces.js"
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"

import {
	User,

	AuthAardvarkTopic,
	UserUmbrellaTopic,
	PaywallPachydermTopic,
	QuestionQuarryTopic,
	LiveshowLizardTopic,
	ScheduleSentryTopic,

	TokenStoreTopic,
	AccountPopupTopic,
} from "../types.js"

//
// RENRAKU
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	authAardvark: AuthAardvarkTopic
}

export interface UserApi extends RenrakuApi<UserApi> {
	userUmbrella: UserUmbrellaTopic<User>
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallPachyderm: PaywallPachydermTopic
}

export interface QuestionApi extends RenrakuApi<QuestionApi> {
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
