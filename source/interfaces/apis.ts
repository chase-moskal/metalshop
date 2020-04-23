
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

export {Topic, RenrakuApi, CrosscallApi}

import {
	AccountPopupTopic,
	AuthDealerTopic,
	TokenStorageTopic,
	AuthExchangerTopic,
	AuthVanguardTopic,
	PaywallOverlordTopic,
	LiveshowGovernorTopic,
} from "../interfaces.js"

import {ScheduleSentryTopic} from "../business/schedule-sentry/interfaces.js"
import {QuestionsBureauTopic} from "../business/questions-bureau/interfaces.js"
import {ProfileMagistrateTopic} from "../business/profile-magistrate/interfaces.js"

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
	paywallGuardian: PaywallOverlordTopic
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
