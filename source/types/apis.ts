
import {Api as RenrakuApi} from "renraku/dist/interfaces.js"
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"

import {
	User,
	MetalSettings,

	AuthAardvarkTopic,
	UserUmbrellaTopic,
	ClaimsCardinalTopic,
	QuestionQuarryTopic,
	LiveshowLizardTopic,
	ScheduleSentryTopic,
	SettingsSheriffTopic,
	PremiumPachydermTopic,

	TokenStoreTopic,
	AccountPopupTopic,
} from "../types.js"

//
// RENRAKU
//

export interface CoreSystemsApi<U extends User> extends RenrakuApi<CoreSystemsApi<U>> {
	authAardvark: AuthAardvarkTopic
	userUmbrella: UserUmbrellaTopic<U>
}

export interface CoreSecuredApi<U extends User> extends RenrakuApi<CoreSecuredApi<U>> {
	claimsCardinal: ClaimsCardinalTopic<U>
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	premiumPachyderm: PremiumPachydermTopic
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

export interface SettingsApi extends RenrakuApi<SettingsApi> {
	settingsSheriff: SettingsSheriffTopic<MetalSettings>
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
