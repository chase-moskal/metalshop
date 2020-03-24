
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

export {Topic, RenrakuApi, CrosscallApi}

import {
	AccountPopupTopic,
	ClaimsDealerTopic,
	TokenStorageTopic,
	AuthExchangerTopic,
	VimeoGovernorTopic,
	ClaimsVanguardTopic,
	PaywallGuardianTopic,
	ProfileMagistrateTopic,
} from "./topics.js"

//
// renraku api's
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	claimsDealer: ClaimsDealerTopic
	authExchanger: AuthExchangerTopic
	claimsVanguard: ClaimsVanguardTopic
}

export interface ProfileApi extends RenrakuApi<ProfileApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallGuardian: PaywallGuardianTopic
}

export interface VimeoApi extends RenrakuApi<VimeoApi> {
	vimeoGovernor: VimeoGovernorTopic
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
