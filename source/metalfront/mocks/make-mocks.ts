
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {generateId} from "../../toolbox/generate-id.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../toolbox/dbby/dbby-memory.js"
import {makeDbbyStorage} from "../../toolbox/dbby/dbby-storage.js"

import {mockLatency} from "../mocks/mock-latency.js"

import {
	ClaimsRow,
	MetalUser,
	MetalScope,
	Authorizer,
	AccountRow,
	ProfileRow,
	QuestionRow,
	LiveshowRow,
	SettingsRow,
	AccessPayload,
	PremiumGiftRow,
	QuestionLikeRow,
	ScheduleEventRow,
	StripeBillingRow,
	StripePremiumRow,
	AuthAardvarkTopic,
	UserUmbrellaTopic,
	QuestionReportRow,
	QuestionQuarryTopic,
	PremiumPachydermTopic,
} from "../../types.js"
import {
	MetalOptions,
	DecodeAccessToken,
	TriggerAccountPopup,
	TriggerCheckoutPopup,
} from "../types.js"

import {makeTokenStore} from "../../business/core/token-store.js"
import {makeCoreSystems} from "../../business/core/core-systems.js"
import * as evaluators from "../../business/core/user-evaluators.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {makeLiveshowLizard} from "../../business/liveshow/liveshow-lizard.js"
import {makeScheduleSentry} from "../../business/schedule/schedule-sentry.js"
import {makeQuestionQuarry} from "../../business/questions/question-quarry.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {MockStripeTables} from "../../business/paywall/mocks/mock-stripe-types.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {mockVerifyGoogleToken, mockSignGoogleToken} from "../../business/core/mocks/mock-google-tokens.js"

import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"

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
	const {authAardvark, userUmbrella} = makeCoreSystems({
		claimsTable,
		accountTable,
		profileTable,
		accessTokenLifespan: minute * 20,
		refreshTokenLifespan: day * 90,
		signToken,
		verifyToken,
		generateNickname,
		validateProfile: () => true,
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

	const liveshowLizard = makeLiveshowLizard({
		liveshowTable,
		authorize,
		userCanRead: evaluators.isPremium,
		userCanWrite: evaluators.isPremium,
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
		mockLatency(lag1, claimsTable)
		mockLatency(lag1, accountTable)
		mockLatency(lag1, profileTable)
		mockLatency(lag1, questionTable)
		mockLatency(lag1, liveshowTable)
		mockLatency(lag1, settingsTable)
		mockLatency(lag1, premiumGiftTable)
		mockLatency(lag1, questionLikeTable)
		mockLatency(lag1, stripeBillingTable)
		mockLatency(lag1, stripePremiumTable)
		mockLatency(lag1, scheduleEventTable)
		mockLatency(lag1, questionReportTable)
		mockLatency(lag1, mockStripeTables.customers)
		mockLatency(lag1, mockStripeTables.setupIntents)
		mockLatency(lag1, mockStripeTables.subscriptions)
		mockLatency(lag1, mockStripeTables.paymentMethods)
	
		const lag2 = 200
		mockLatency(lag2, tokenStore)
		mockLatency(lag2, userUmbrella)
		mockLatency(lag2, liveshowLizard)
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
			liveshowLizard,
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
