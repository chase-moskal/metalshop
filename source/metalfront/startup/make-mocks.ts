
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
import {makeLiveshowGovernor} from "../../business/liveshow/liveshow-governor.js"
import {makeSettingsDatalayer} from "../../business/settings/settings-datalayer.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {curryInitializePersona} from "../../business/auth/curry-initialize-persona.js"
import {mockVerifyGoogleToken} from "../../business/auth/mocks/mock-verify-google-token.js"

import {nap} from "../toolbox/nap.js"
import {random8} from "../../toolbox/random8.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../toolbox/dbby/dbby-memory.js"
import {generateId as defaultGenerateUserId} from "../../toolbox/generate-id.js"
import {AccessPayload, UserTable, ProfileTable} from "../../interfaces.js"

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

	const minute = 1000 * 60
	const day = minute * 60 * 24

	const googleId = `mock-google-user-${random8()}`
	const googleToken = `mock-google-token-${random8()}`
	const premiumStripePlanId = `mock-premium-stripe-plan-${random8()}`

	const userTable: UserTable = dbbyMemory()
	const profileTable: ProfileTable = dbbyMemory()

	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()
	const verifyGoogleToken = mockVerifyGoogleToken({
		googleResult: {
			googleId,
			name: googleUserName,
			avatar: googleUserAvatar,
		}
	})

	const mockAdminAccessToken = await signToken<AccessPayload>({
			user: {
				claims: {admin: true, premium: true},
				userId: "u123"
			}
		}, day * 365)

	const {authVanguard, authDealer} = makeAuthVanguard({
		userTable,
		generateUserId,
	})

	const profileMagistrate = makeProfileMagistrate({
		verifyToken,
		profileTable,
	})

	const settingsDatalayer = makeSettingsDatalayer({
		settingsTable: dbbyMemory()
	})

	const settingsSheriff = makeSettingsSheriff({
		verifyToken,
		profileMagistrate,
		settingsDatalayer,
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
		refreshTokenExpiresMilliseconds: day * 365,
		accessTokenExpiresMilliseconds: minute * 20,
	})

	const tokenStore = new TokenStore({
		authExchanger,
		storage: mockStorage(),
	})

	const questionsBureau = makeQuestionsBureau({
		authDealer,
		verifyToken,
		profileMagistrate,
		questionTable: dbbyMemory(),
	})

	const liveshowGovernor = makeLiveshowGovernor({
		verifyToken,
		liveshowTable: dbbyMemory(),
	})

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

	const scheduleSentry = makeScheduleSentry({
		verifyToken,
		scheduleTable: dbbyMemory(),
	})

	const checkoutPopupUrl = "http://metaldev.chasemoskal.com:8003/html/checkout"

	const triggerAccountPopup: TriggerAccountPopup =
		async() => authExchanger.authenticateViaGoogle({googleToken})

	const triggerCheckoutPopup: TriggerCheckoutPopup =
		async({stripeSessionId}) => null

	const adminSearch = mockAdminSearch()

	//
	// starting conditions
	//

	await liveshowGovernor.setShow({
		vimeoId: "109943349",
		videoName: "livestream",
		accessToken: mockAdminAccessToken,
	})

	await scheduleSentry.setEvent({
		accessToken: mockAdminAccessToken,
		event: {
			name: "countdown1",
			time: Date.now() + (day * 3.14159)
		},
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
