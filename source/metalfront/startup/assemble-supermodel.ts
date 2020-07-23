
import {autorun} from "mobx"
import {MetalOptions, Supermodel, MetalGenerics} from "../types.js"

import {AuthModel} from "../models/auth-model.js"
// import {SeekerModel} from "../models/seeker-model.js"
import {PaywallModel} from "../models/paywall-model.js"
import {LiveshowModel} from "../models/liveshow-model.js"
import {ScheduleModel} from "../models/schedule-model.js"
import {PersonalModel} from "../models/personal-model.js"
import {SettingsModel} from "../models/settings-model.js"
import {QuestionsModel} from "../models/questions-model.js"
// import {ProfileModel} from "../models/profile-model.js"

export function assembleSupermodel({
	logger,
	tokenStore,
	userUmbrella,
	liveshowLizard,
	scheduleSentry,
	questionQuarry,
	settingsSheriff,
	premiumPachyderm,
	////////
	checkoutPopupUrl,
	decodeAccessToken,
	triggerAccountPopup,
	triggerCheckoutPopup,
}: MetalOptions<MetalGenerics>): Supermodel {

	const auth = new AuthModel({
		tokenStore,
		decodeAccessToken,
		triggerAccountPopup,
		expiryGraceSeconds: 60
	})

	const personal = new PersonalModel({
		logger,
		userUmbrella,
		settingsSheriff,
	})

	const supermodel = {
		auth,
		personal,
		// seeker: new SeekerModel({adminSearch}),
		schedule: new ScheduleModel({scheduleSentry}),
		liveshow: new LiveshowModel({liveshowLizard}),
		questions: new QuestionsModel({questionQuarry}),
	
		// TODO consider uncoupling inter-model dependencies?
		paywall: new PaywallModel({
			auth,
			premiumPachyderm,
			checkoutPopupUrl,
			triggerCheckoutPopup,
		}),
	}

	autorun(() => {
		const {authLoad} = supermodel.auth
		supermodel.personal.handleAuthLoad(authLoad)
		supermodel.liveshow.handleAuthLoad(authLoad)
		supermodel.schedule.handleAuthLoad(authLoad)
		supermodel.questions.handleAuthLoad(authLoad)
		// supermodel.seeker.handleAuthLoad(authLoad)
	})

	// autorun(() => {
	// 	const {profile} = supermodel.personal
	// 	supermodel.questions.handleProfileUpdate(profile)
	// })

	return supermodel
}
