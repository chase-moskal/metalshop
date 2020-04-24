
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

export {Topic, RenrakuApi, CrosscallApi}

import {
	AuthDealerTopic,
	AccountPopupTopic,
	AuthVanguardTopic,
	TokenStorageTopic,
	AuthExchangerTopic,
	StripeLiaisonTopic,
	ScheduleSentryTopic,
	QuestionsBureauTopic,
	LiveshowGovernorTopic,
	ProfileMagistrateTopic,
} from "../interfaces.js"

//
// renraku api's
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	authDealer: AuthDealerTopic
	authVanguard: AuthVanguardTopic
	authExchanger: AuthExchangerTopic
}

export interface ProfileApi extends RenrakuApi<ProfileApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	stripeLiaison: StripeLiaisonTopic
}

export interface LiveshowApi extends RenrakuApi<LiveshowApi> {
	liveshowGovernor: LiveshowGovernorTopic
}

export interface QuestionsApi extends RenrakuApi<QuestionsApi> {
	questionsBureau: QuestionsBureauTopic
}

export interface ScheduleApi extends RenrakuApi<ScheduleApi> {
	scheduleSentry: ScheduleSentryTopic
}

//
// crosscall api's
//

export interface TokenStorageApi extends CrosscallApi<TokenStorageApi> {
	tokenStorage: TokenStorageTopic
}

export interface AccountPopupApi extends CrosscallApi<AccountPopupApi> {
	accountPopup: AccountPopupTopic
}
