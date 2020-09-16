
import {share} from "../framework/share.js"
import {ButtonPremiumShare, PersonalShare, MyAvatarShare, AdminModeShare, QuestionsShare, Supermodel, AccountShare, CountdownShare, PaywallShare, LiveshowShare, AppListShare} from "../types.js"

import {IronReset} from "../components/iron-reset.js"
import {IronLoading} from "../components/iron-loading.js"
import {IronTextInput} from "../components/iron-text-input.js"

import {CobaltCard} from "../components/cobalt-card.js"
import {CobaltAvatar} from "../components/cobalt-avatar.js"

import {MetalAccount} from "../components/metal-account.js"
import {MetalPaywall} from "../components/metal-paywall.js"
import {MetalIsStaff} from "../components/metal-is-staff.js"
import {MetalLiveshow} from "../components/metal-liveshow.js"
import {MetalPersonal} from "../components/metal-personal.js"
import {MetalMyAvatar} from "../components/metal-my-avatar.js"
import {MetalCountdown} from "../components/metal-countdown.js"
import {MetalAdminMode} from "../components/metal-admin-mode.js"
import {MetalIsPremium} from "../components/metal-is-premium.js"
import {MetalButtonAuth} from "../components/metal-button-auth.js"
import {MetalIsLoggedin} from "../components/metal-is-loggedin.js"
import {MetalButtonPremium} from "../components/metal-button-premium.js"
import {MetalQuestions} from "../components/questions/metal-questions.js"

import {MetalAppList} from "../components/app/metal-app-list.js"

export const wireComponentShares = (supermodel: Supermodel) => {
	const accountShare = (): AccountShare => ({
		login: supermodel.auth.login,
		logout: supermodel.auth.logout,
		authLoad: supermodel.auth.authLoad,
	})
	return {
		IronReset,
		IronLoading,
		IronTextInput,

		CobaltCard,
		CobaltAvatar,

		MetalAccount: share(MetalAccount, accountShare),
		MetalButtonAuth: share(MetalButtonAuth, accountShare),
		MetalIsLoggedin: share(MetalIsLoggedin, accountShare),
		MetalIsPremium: share(MetalIsPremium, accountShare),
		MetalIsStaff: share(MetalIsStaff, accountShare),
		MetalPersonal: share(MetalPersonal, (): PersonalShare => ({
			personal: supermodel.personal.personal,
			personalLoad: supermodel.personal.personalLoad,
			saveProfile: supermodel.personal.saveProfile,
			setAdminMode: undefined,
		})),
		MetalCountdown: share(MetalCountdown, (): CountdownShare => ({
			events: supermodel.schedule.events,
			authLoad: supermodel.auth.authLoad,
			loadEvent: supermodel.schedule.loadEvent,
			saveEvent: supermodel.schedule.saveEvent,
		})),
		MetalPaywall: share(MetalPaywall, (): PaywallShare => ({
			personalLoad: supermodel.personal.personalLoad,
			premium: supermodel.paywall.premium,
			premiumUntil: supermodel.paywall.premiumUntil,
			premiumInfoLoad: supermodel.paywall.premiumInfoLoad,
			updatePremium: supermodel.paywall.updatePremium,
			cancelPremium: supermodel.paywall.cancelPremium,
			checkoutPremium: supermodel.paywall.checkoutPremium,
		})),
		MetalButtonPremium: share(MetalButtonPremium, (): ButtonPremiumShare => ({
			personalLoad: supermodel.personal.personalLoad,
			premium: supermodel.paywall.premium,
			premiumUntil: supermodel.paywall.premiumUntil,
			premiumInfoLoad: supermodel.paywall.premiumInfoLoad,
			login: supermodel.auth.login,
			checkoutPremium: supermodel.paywall.checkoutPremium,
		})),
		MetalLiveshow: share(MetalLiveshow, (): LiveshowShare => ({
			authLoad: supermodel.auth.authLoad,
			makeViewModel: supermodel.liveshow.makeViewModel,
		})),
		MetalMyAvatar: share(MetalMyAvatar, (): MyAvatarShare => ({
			personalLoad: supermodel.personal.personalLoad,
		})),
		MetalAdminMode: share(MetalAdminMode, (): AdminModeShare => ({
			personalLoad: supermodel.personal.personalLoad,
			setAdminMode: undefined,
		})),
		MetalQuestions: share(MetalQuestions, (): QuestionsShare => ({
			user: supermodel.auth.user,
			uiBureau: supermodel.questions.questionQuarryUi,
			fetchCachedQuestions: supermodel.questions.fetchCachedQuestions,
		})),
	}
}
