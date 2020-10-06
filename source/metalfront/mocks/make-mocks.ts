
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {ClaimsRow, MetalUser, MetalScope, Authorizer, AccountRow, ProfileRow, QuestionRow, SettingsRow, AccessPayload, PremiumGiftRow, QuestionLikeRow, ScheduleEventRow, StripeBillingRow, StripePremiumRow, AuthAardvarkTopic, UserUmbrellaTopic, QuestionReportRow, QuestionQuarryTopic, PremiumPachydermTopic} from "../../types.js"

import {LiveshowRow} from "../../features/liveshow/liveshow-types.js"
import {makeLiveshowApi} from "../../features/liveshow/liveshow-api.js"

import {makeTokenStore} from "../../business/auth/token-store.js"
import {makeAuthSystems} from "../../business/auth/auth-systems.js"
import * as evaluators from "../../business/auth/user-evaluators.js"
import {validateProfile} from "../../business/auth/validate-profile.js"
import {makeClaimsCardinal} from "../../business/auth/claims-cardinal.js"
import {makeScheduleSentry} from "../../business/schedule/schedule-sentry.js"
import {makeQuestionQuarry} from "../../business/questions/question-quarry.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {MockStripeTables} from "../../business/paywall/mocks/mock-stripe-types.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {mockVerifyGoogleToken, mockSignGoogleToken} from "../../business/auth/mocks/mock-google-tokens.js"

import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {generateId} from "../../toolbox/generate-id.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../toolbox/dbby/dbby-memory.js"
import {makeDbbyStorage} from "../../toolbox/dbby/dbby-storage.js"

import {mockLatency, mockLatencyDbby} from "../mocks/mock-latency.js"
import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"

import {MetalOptions, DecodeAccessToken, TriggerAccountPopup, TriggerCheckoutPopup} from "../types.js"

export type PrepareMockData = (options: {
		authAardvark: AuthAardvarkTopic,
		questionQuarry: QuestionQuarryTopic,
		premiumPachyderm: PremiumPachydermTopic,
		userUmbrella: UserUmbrellaTopic<MetalUser>,
	}) => Promise<void>

export async function makeMocks({
		logger = console,
		googleUserName,
		googleUserAvatar,
		generateNickname,
		decodeAccessToken = defaultDecodeAccessToken,
	}: {
		logger: Logger
		googleUserName: string
		googleUserAvatar: string
		generateNickname: () => string
		decodeAccessToken?: DecodeAccessToken<MetalUser>
	}) {

	const minute = 1000 * 60
	const day = minute * 60 * 24

	const premiumStripePlanId = generateId()
	const googleToken = await mockSignGoogleToken({
		googleId: generateId(),
		name: googleUserName,
		avatar: googleUserAvatar,
	})

	const memoryTable = (name: string) => dbbyMemory({
		dbbyStorage: makeDbbyStorage(localStorage, name)
	})
	const claimsTable: DbbyTable<ClaimsRow> = memoryTable("claims")
	const accountTable: DbbyTable<AccountRow> = memoryTable("account")
	const profileTable: DbbyTable<ProfileRow> = memoryTable("profile")
	const questionTable: DbbyTable<QuestionRow> = memoryTable("question")
	const liveshowTable: DbbyTable<LiveshowRow> = memoryTable("liveshow")
	const settingsTable: DbbyTable<SettingsRow> = memoryTable("settings")
	const premiumGiftTable: DbbyTable<PremiumGiftRow> = memoryTable("premium")
	const questionLikeTable: DbbyTable<QuestionLikeRow> = memoryTable("questionLike")
	const stripeBillingTable: DbbyTable<StripeBillingRow> = memoryTable("stripeBilling")
	const stripePremiumTable: DbbyTable<StripePremiumRow> = memoryTable("stripePremium")
	const scheduleEventTable: DbbyTable<ScheduleEventRow> = memoryTable("scheduleEvent")
	const questionReportTable: DbbyTable<QuestionReportRow> = memoryTable("questionReport")
	const mockStripeTables: MockStripeTables = {
		customers: memoryTable("stripeLiaison-customers"),
		setupIntents: memoryTable("stripeLiaison-setupIntents"),
		subscriptions: memoryTable("stripeLiaison-subscriptions"),
		paymentMethods: memoryTable("stripeLiaison-paymentMethods"),
	}

	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()

	const authorize: Authorizer<MetalUser> = async(accessToken) => {
		const {user} = await verifyToken<AccessPayload<MetalScope, MetalUser>>(accessToken)
		return user
	}

	const claimsCardinal = makeClaimsCardinal<MetalUser>({claimsTable})
	const {authAardvark, userUmbrella} = makeAuthSystems({
		claimsTable,
		accountTable,
		profileTable,
		refreshTokenLifespan: day * 90,
		accessTokenLifespan: minute * 20,
		signToken,
		verifyToken,
		validateProfile,
		generateNickname,
		verifyGoogleToken: mockVerifyGoogleToken,
	})

	const settingsSheriff = makeSettingsSheriff({
		settingsTable,
		authorize,
	})

	const tokenStore = makeTokenStore({
		authAardvark,
		storage: localStorage,
	})

	const questionQuarry = makeQuestionQuarry({
		userUmbrella,
		questionTable,
		questionLikeTable,
		questionReportTable,
		authorize,
		generateId,
		userCanArchiveBoard: evaluators.isStaff,
		userCanPost: user => evaluators.isPremium(user) && !evaluators.isBanned(user),
		userCanArchiveQuestion: (user, authorId) => evaluators.isStaff(user) || user.userId === authorId,
	})

	const {liveshowTopic} = makeLiveshowApi({
		auth: async({appToken, accessToken}) => ({
			// TODO app token
			app: {appId: "app123", origins: [], created: Date.now(), expiry: Date.now() + 99999999, root: false}, // await verifyToken<AppPayload>(appToken),
			access: await verifyToken<AccessPayload>(accessToken),
		}),
		getDbbyTable: memoryTable,
		userCanRead: evaluators.isPremium,
		userCanWrite: evaluators.isStaff,
	})

	const {premiumDatalayer, stripeLiaison} = mockStripeCircuit({
		logger,
		userUmbrella,
		claimsCardinal,
		premiumGiftTable,
		stripeBillingTable,
		stripePremiumTable,
		tables: mockStripeTables,
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
		userCanChangeSchedule: evaluators.isStaff,
	})

	const checkoutPopupUrl = undefined

	const triggerAccountPopup: TriggerAccountPopup
		= async() => authAardvark.authenticateViaGoogle({googleToken})

	const triggerCheckoutPopup: TriggerCheckoutPopup
		= async({stripeSessionId}) => null

	function applyMockLatency() {
		const lag1 = 100
		mockLatencyDbby(lag1, claimsTable)
		mockLatencyDbby(lag1, accountTable)
		mockLatencyDbby(lag1, profileTable)
		mockLatencyDbby(lag1, questionTable)
		mockLatencyDbby(lag1, liveshowTable)
		mockLatencyDbby(lag1, settingsTable)
		mockLatencyDbby(lag1, premiumGiftTable)
		mockLatencyDbby(lag1, questionLikeTable)
		mockLatencyDbby(lag1, stripeBillingTable)
		mockLatencyDbby(lag1, stripePremiumTable)
		mockLatencyDbby(lag1, scheduleEventTable)
		mockLatencyDbby(lag1, questionReportTable)
		mockLatencyDbby(lag1, mockStripeTables.customers)
		mockLatencyDbby(lag1, mockStripeTables.setupIntents)
		mockLatencyDbby(lag1, mockStripeTables.subscriptions)
		mockLatencyDbby(lag1, mockStripeTables.paymentMethods)
	
		const lag2 = 200
		mockLatency(lag2, tokenStore)
		mockLatency(lag2, userUmbrella)
		mockLatency(lag2, liveshowTopic)
		mockLatency(lag2, questionQuarry)
		mockLatency(lag2, scheduleSentry)
		mockLatency(lag2, settingsSheriff)
		mockLatency(lag2, premiumPachyderm)
		mockLatency(lag2, authAardvark)
		mockLatency(lag2, claimsCardinal)
	}

	return {
		options: <MetalOptions>{
			logger,
			tokenStore,
			userUmbrella,
			liveshowTopic,
			questionQuarry,
			scheduleSentry,
			settingsSheriff,
			checkoutPopupUrl,
			premiumPachyderm,
			decodeAccessToken,
			triggerAccountPopup,
			triggerCheckoutPopup,
		},
		mockeries: {
			googleToken,
			authAardvark,
			claimsCardinal,
			signToken,
			verifyToken,
			applyMockLatency,
		},
	}
}
