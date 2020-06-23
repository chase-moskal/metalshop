
import {Topic, Method} from "renraku/dist/interfaces.js"
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {TokenStore} from "../../business/auth/token-store.js"
import {makeAuthVanguard} from "../../business/auth/vanguard.js"
import {makeAuthExchanger} from "../../business/auth/exchanger.js"
import {mockStorage} from "../../business/auth/mocks/mock-storage.js"
import {makePaywallLiaison} from "../../business/paywall/liaison.js"
import {makeScheduleSentry} from "../../business/schedule/sentry.js"
import {makeQuestionsBureau} from "../../business/questions/bureau.js"
import {makeProfileMagistrate} from "../../business/profile/magistrate.js"
import {mockAdminSearch} from "../../business/admin/mocks/mock-admin-search.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"
import {mockUserDatalayer} from "../../business/auth/mocks/mock-user-datalayer.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {curryInitializePersona} from "../../business/auth/curry-initialize-persona.js"
import {mockProfileDatalayer} from "../../business/profile/mocks/mock-profile-datalayer.js"
import {mockVerifyGoogleToken} from "../../business/auth/mocks/mock-verify-google-token.js"
import {mockScheduleDatalayer} from "../../business/schedule/mocks/mock-schedule-datalayer.js"
import {mockSettingsDatalayer} from "../../business/settings/mocks/mock-settings-datalayer.js"
import {generateUserId as defaultGenerateUserId} from "../../business/auth/generate-user-id.js"
import {mockQuestionsDatalayer} from "../../business/questions/mocks/mock-questions-datalayer.js"

import {random8} from "../../toolbox/random8.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {AccessToken, LiveshowGovernorTopic, AccessPayload} from "../../interfaces.js"

import {nap} from "../toolbox/nap.js"
import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"
import {TriggerAccountPopup, TriggerCheckoutPopup, MetalOptions, DecodeAccessToken} from "../interfaces.js"

export const makeMocks = async({
		startAdmin,
		startPremium,
		startLoggedIn,
		logger = console,
		googleUserName = "Steve Stephenson",
		generateUserId = defaultGenerateUserId,
		decodeAccessToken = defaultDecodeAccessToken,
		googleUserAvatar = "https://i.imgur.com/CEqYyCy.jpg",
		generateRandomNickname = () => `${random8().toUpperCase()}`,
	}: {
		logger: Logger
		startAdmin: boolean
		startPremium: boolean
		startLoggedIn: boolean
		googleUserName?: string
		googleUserAvatar?: string
		generateUserId?: () => string
		decodeAccessToken?: DecodeAccessToken
		generateRandomNickname?: () => string
	}): Promise<MetalOptions> => {

	const googleId = `mock-google-user-${random8()}`
	const googleToken = `mock-google-token-${random8()}`
	const premiumStripePlanId = `mock-premium-stripe-plan-${random8()}`

	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()
	const userDatalayer = mockUserDatalayer()
	const profileDatalayer = mockProfileDatalayer()
	const verifyGoogleToken = mockVerifyGoogleToken({
		googleResult: {
			googleId,
			name: googleUserName,
			avatar: googleUserAvatar,
		}
	})

	const {authVanguard, authDealer} = makeAuthVanguard({
		userDatalayer,
		generateUserId,
	})

	const profileMagistrate = makeProfileMagistrate({
		verifyToken,
		profileDatalayer,
	})

	const minute = 1000 * 60
	const day = minute * 60 * 24
	const accessTokenExpiresMilliseconds = 20 * minute
	const refreshTokenExpiresMilliseconds = day * 365

	const settingsDatalayer = mockSettingsDatalayer()
	const settingsSheriff = makeSettingsSheriff({
		verifyToken,
		settingsDatalayer,
		profileMagistrate,
	})

	const initializePersona = curryInitializePersona({
		settingsSheriff,
		profileMagistrate,
		generateRandomNickname,
	})

	const authExchanger = makeAuthExchanger({
		signToken,
		verifyToken,
		authVanguard,
		verifyGoogleToken,
		initializePersona,
		accessTokenExpiresMilliseconds,
		refreshTokenExpiresMilliseconds,
	})

	const tokenStore = new TokenStore({
		authExchanger,
		storage: mockStorage(),
	})

	const questionsDatalayer = mockQuestionsDatalayer()
	const questionsBureau = makeQuestionsBureau({
		authDealer,
		verifyToken,
		profileMagistrate,
		questionsDatalayer,
	})

	let vimeoId = "109943349"
	const liveshowGovernor: LiveshowGovernorTopic = {
		async getShow(options: {
			accessToken: AccessToken
			videoName: string
		}): Promise<{vimeoId: string}> {
			return {vimeoId}
		},
		async setShow({vimeoId}: {
			accessToken: AccessToken
			vimeoId: string
			videoName: string
		}) {
			this._vimeoId = vimeoId
		}
	}

	const {stripeDatalayer, billingDatalayer} = mockStripeCircuit({
		authVanguard,
		logger: console,
		settingsDatalayer,
	})
	const paywallLiaison = makePaywallLiaison({
		verifyToken,
		stripeDatalayer,
		billingDatalayer,
		premiumStripePlanId,
	})

	const scheduleDatalayer = mockScheduleDatalayer()
	const scheduleSentry = makeScheduleSentry({verifyToken, scheduleDatalayer})

	const checkoutPopupUrl = "http://metaldev.chasemoskal.com:8003/html/checkout"

	const triggerAccountPopup: TriggerAccountPopup =
		async() => authExchanger.authenticateViaGoogle({googleToken})

	const triggerCheckoutPopup: TriggerCheckoutPopup =
		async({stripeSessionId}) => null

	const adminSearch = mockAdminSearch()

	//
	// starting conditions
	//

	const days = 1000 * 60 * 60 * 24
	await scheduleDatalayer.setEvent("countdown1", {
		time: Date.now() + (3.14159 * days)
	})

	await tokenStore.clearTokens()

	if (startLoggedIn || startAdmin || startPremium) {
		const authTokens = await authExchanger.authenticateViaGoogle({googleToken})

		if (startAdmin) {
			const {user} = await verifyToken<AccessPayload>(authTokens.accessToken)
			const {userId, claims} = user
			claims.admin = true
			await authVanguard.setClaims({userId, claims})
		}

		if (startPremium) {
			await paywallLiaison.checkoutPremium({
				popupUrl: checkoutPopupUrl,
				accessToken: authTokens.accessToken,
			})
		}

		if (startLoggedIn) {
			const {refreshToken} = authTokens
			authTokens.accessToken = await authExchanger.authorize({refreshToken})
			await tokenStore.writeTokens(authTokens)
		}
	}

	// TODO latency
	// adding mock latency
	{
		const lag = <T extends (...args: any[]) => Promise<any>>(func: T) => {
			return async function(...args: any[]) {
				const ms = (Math.random() * 300) + 100
				console.log(`mock lag added: ${func.name} by ${ms.toFixed(0)} milliseconds`)
				await nap(ms)
				return func.apply(this, args)
			}
		}

		for (const object of Object.values(<{[key: string]: Topic}>{
			authDealer,
			adminSearch,
			paywallLiaison,
			scheduleSentry,
			settingsSheriff,
			questionsBureau,
			liveshowGovernor,
			profileMagistrate,
		})) {
			for (const [key, value] of Object.entries<Method>(object)) {
				object[key] = lag(value)
			}
		}
	}

	return {
		logger,
		authDealer,
		tokenStore,
		adminSearch,
		paywallLiaison,
		scheduleSentry,
		settingsSheriff,
		questionsBureau,
		liveshowGovernor,
		checkoutPopupUrl,
		decodeAccessToken,
		profileMagistrate,
		triggerAccountPopup,
		triggerCheckoutPopup,
	}
}
