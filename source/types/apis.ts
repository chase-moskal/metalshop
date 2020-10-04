
import {Api as RenrakuApi} from "renraku/dist/types.js"
import {Api as CrosscallApi} from "crosscall/dist/types.js"

import {
	User,
	MetalSettings,

	AuthAardvarkTopic,
	UserUmbrellaTopic,
	ClaimsCardinalTopic,
	QuestionQuarryTopic,
	ScheduleSentryTopic,
	SettingsSheriffTopic,
	PremiumPachydermTopic,

	TokenStoreTopic,
	AccountPopupTopic,
} from "../types.js"

//
// RENRAKU
//

export interface AuthSystemsApi<U extends User> extends RenrakuApi {
	authAardvark: AuthAardvarkTopic
	userUmbrella: UserUmbrellaTopic<U>
}

export interface AuthSecuredApi<U extends User> extends RenrakuApi {
	claimsCardinal: ClaimsCardinalTopic<U>
}

export interface PaywallApi extends RenrakuApi {
	premiumPachyderm: PremiumPachydermTopic
}

export interface QuestionsApi extends RenrakuApi {
	questionQuarry: QuestionQuarryTopic
}

export interface ScheduleApi extends RenrakuApi {
	scheduleSentry: ScheduleSentryTopic
}

export interface SettingsApi extends RenrakuApi {
	settingsSheriff: SettingsSheriffTopic<MetalSettings>
}

//
// CROSSCALL
//

export interface VaultApi extends CrosscallApi {
	tokenStore: TokenStoreTopic
}

export interface AccountPopupApi extends CrosscallApi {
	accountPopup: AccountPopupTopic
}
