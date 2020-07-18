
import {Topic, Method} from "renraku/dist/interfaces.js"
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {random8} from "../../toolbox/random8.js"
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../toolbox/dbby/dbby-memory.js"
import {generateId as defaultGenerateId} from "../../toolbox/generate-id.js"
import {
	Scope,
	Authorizer,
	PaywallUser,
	AccessPayload,
	AccountRow,
	ClaimsRow,
	ProfileRow,
	StripeBillingRow,
	StripePremiumRow,
	PremiumGiftRow,
	QuestionRow,
	QuestionLikeRow,
	QuestionReportRow,
	LiveshowRow,
	ScheduleEventRow,
	SettingsRow,
} from "../../types.js"

import {nap} from "../toolbox/nap.js"
import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"
import {
	MetalOptions,
	DecodeAccessToken,
	TriggerAccountPopup,
	TriggerCheckoutPopup,
} from "../interfaces.js"

import {makeTokenStore} from "../../newbiz/core/token-store.js"
import {makeCoreSystems} from "../../newbiz/core/core-systems.js"
import {makeClaimsCardinal} from "../../newbiz/core/claims-cardinal.js"
import {makeSettingsSheriff} from "../../newbiz/settings/settings-sheriff.js"
import {mockVerifyGoogleToken} from "../../newbiz/core/mocks/mock-verify-google-token.js"
import {mockStorage} from "../../business/auth/mocks/mock-storage.js"
import {makeQuestionQuarry} from "../../newbiz/questions/question-quarry.js"
import {makeLiveshowLizard} from "../../newbiz/liveshow/liveshow-lizard.js"
import {mockStripeCircuit} from "../../newbiz/paywall/mocks/mock-stripe-circuit.js"
import {makeScheduleSentry} from "../../newbiz/schedule/schedule-sentry.js"
import {makePremiumPachyderm} from "../../newbiz/paywall/premium-pachyderm.js"

export interface DemoScope extends Scope {}
export interface DemoUser extends PaywallUser {}
export type DemoAccessPayload = AccessPayload<DemoScope, DemoUser>

export async function makeMocks({
		startAdmin,
		startPremium,
		startLoggedIn,
		logger = console,
		generateId = defaultGenerateId,
		googleUserName = "Steve Stephenson",
		decodeAccessToken = defaultDecodeAccessToken,
		googleUserAvatar = "https://i.imgur.com/CEqYyCy.jpg",
		generateNickname = () => `${random8().toUpperCase()}`,
	}: {
		logger: Logger
		startAdmin: boolean
		startPremium: boolean
		startLoggedIn: boolean
		googleUserName?: string
		googleUserAvatar?: string
		generateId?: () => string
		generateNickname?: () => string
		decodeAccessToken?: DecodeAccessToken
	}): Promise<MetalOptions> {

	const minute = 1000 * 60
	const day = minute * 60 * 24
	const googleId = `mock-google-user-${random8()}`
	const googleToken = `mock-google-token-${random8()}`
	const premiumStripePlanId = `mock-premium-stripe-plan-${random8()}`

	const accountTable: DbbyTable<AccountRow> = dbbyMemory()
	const claimsTable: DbbyTable<ClaimsRow> = dbbyMemory()
	const profileTable: DbbyTable<ProfileRow> = dbbyMemory()
	const stripeBillingTable: DbbyTable<StripeBillingRow> = dbbyMemory()
	const stripePremiumTable: DbbyTable<StripePremiumRow> = dbbyMemory()
	const premiumGiftTable: DbbyTable<PremiumGiftRow> = dbbyMemory()
	const questionTable: DbbyTable<QuestionRow> = dbbyMemory()
	const questionLikeTable: DbbyTable<QuestionLikeRow> = dbbyMemory()
	const questionReportTable: DbbyTable<QuestionReportRow> = dbbyMemory()
	const liveshowTable: DbbyTable<LiveshowRow> = dbbyMemory()
	const scheduleEventTable: DbbyTable<ScheduleEventRow> = dbbyMemory()
	const settingsTable: DbbyTable<SettingsRow> = dbbyMemory()

	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()
	const verifyGoogleToken = mockVerifyGoogleToken({
		googleResult: {
			googleId,
			name: googleUserName,
			avatar: googleUserAvatar,
		}
	})

	const mockAdminAccessToken = await signToken<DemoAccessPayload>({
		scope: {core: true},
		user: {
			userId: "u123",
			claims: {
				admin: true,
				staff: true,
				banUntil: undefined,
				banReason: undefined,
				joined: Date.now() - (day * 10),
				lastLogin: Date.now() - minute,
				premiumUntil: Date.now() + (day * 30)
			},
			profile: {
				avatar: undefined,
				nickname: "Admin Adminisaurus",
				tagline: "doesn't exist",
			},
		}
	}, day * 365)

	const authorize: Authorizer<DemoUser> = async(accessToken) =>
		verifyToken(accessToken)

	const userPremiumIsValid = (user: DemoUser) => !!user.claims.premiumUntil
		? Date.now() < user.claims.premiumUntil
		: false

	const userIsABoss = (user: DemoUser) => false
		|| !!user.claims.admin
		|| !!user.claims.staff

	const claimsCardinal = makeClaimsCardinal({claimsTable})
	const {authAardvark, userUmbrella} = makeCoreSystems({
		claimsTable,
		accountTable,
		profileTable,
		expireAccessToken: minute * 20,
		expireRefreshToken: day * 90,
		signToken,
		verifyToken,
		generateNickname,
		verifyGoogleToken,
		validateProfile: () => true,
	})

	const settingsSheriff = makeSettingsSheriff({
		settingsTable,
		authorize,
	})

	const tokenStore = makeTokenStore({
		authAardvark,
		storage: mockStorage(),
	})

	const questionsQuarry = makeQuestionQuarry({
		userUmbrella,
		questionTable,
		questionLikeTable,
		questionReportTable,
		authorize,
		generateId,
		userCanPost: userPremiumIsValid,
		userCanArchiveBoard: userIsABoss,
		userCanArchiveQuestion: userIsABoss,
	})

	const liveshowLizard = makeLiveshowLizard<DemoUser>({
		liveshowTable,
		authorize,
		userCanRead: userPremiumIsValid,
		userCanWrite: userPremiumIsValid,
	})

	const {premiumDatalayer, stripeLiaison} = mockStripeCircuit({
		logger,
		claimsCardinal,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
	})

	const premiumPachyderm = makePremiumPachyderm({
		authorize,
		stripeLiaison,
		premiumDatalayer,
		premiumStripePlanId,
	})

	const scheduleSentry = makeScheduleSentry({
		authorize,
		scheduleEventTable,
		userCanChangeSchedule: userIsABoss,
	})

	const checkoutPopupUrl = "http://metaldev.chasemoskal.com:8003/html/checkout"

	const triggerAccountPopup: TriggerAccountPopup
		= async() => authAardvark.authenticateViaGoogle({googleToken})

	const triggerCheckoutPopup: TriggerCheckoutPopup
		= async({stripeSessionId}) => null

	// const adminSearch = mockAdminSearch()

	//
	// starting conditions
	//

	await liveshowLizard.setShow({
		label: "livestream",
		vimeoId: "109943349",
		accessToken: mockAdminAccessToken,
	})

	await scheduleSentry.setEvent({
		accessToken: mockAdminAccessToken,
		event: {
			label: "countdown1",
			time: Date.now() + (day * 3.14159),
		},
	})

	await tokenStore.clearTokens()

	if (startLoggedIn || startAdmin || startPremium) {
		const authTokens = await authAardvark.authenticateViaGoogle({googleToken})

		if (startAdmin) {
			const {user} = await verifyToken<AccessPayload>(authTokens.accessToken)
			const {userId, claims} = user
			claims.admin = true
			await claimsCardinal.writeClaims({userId, claims})
		}

		if (startPremium) {
			await premiumPachyderm.checkoutPremium({
				popupUrl: checkoutPopupUrl,
				accessToken: authTokens.accessToken,
			})
		}

		if (startLoggedIn) {
			const {refreshToken} = authTokens
			authTokens.accessToken = await authAardvark.authorize({
				refreshToken,
				scope: {core: true},
			})
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
			authAardvark,
			premiumPachyderm,
			scheduleSentry,
			settingsSheriff,
			questionsQuarry,
			liveshowLizard,
		})) {
			for (const [key, value] of Object.entries<Method>(object)) {
				object[key] = lag(value)
			}
		}
	}

	// TODO rework metal options!
	return undefined

	// return {
	// 	logger,
	// 	authDealer,
	// 	tokenStore,
	// 	adminSearch,
	// 	paywallLiaison,
	// 	scheduleSentry,
	// 	settingsSheriff,
	// 	questionsBureau,
	// 	liveshowGovernor,
	// 	checkoutPopupUrl,
	// 	decodeAccessToken,
	// 	profileMagistrate,
	// 	triggerAccountPopup,
	// 	triggerCheckoutPopup,
	// }
}
