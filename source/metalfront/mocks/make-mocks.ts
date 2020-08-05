
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"
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
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {verifyGoogleToken, signGoogleToken} from "../../business/core/mocks/mock-google-tokens.js"

import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"
import { MockStripeTables } from "../../business/paywall/mocks/mock-stripe-types.js"

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
	const googleToken = await signGoogleToken({
		googleId: generateId(),
		name: googleUserName,
		avatar: googleUserAvatar,
	})

	const s = (name: string) => makeDbbyStorage(localStorage, name)
	const claimsTable: DbbyTable<ClaimsRow> = dbbyMemory({dbbyStorage: s("claims")})
	const accountTable: DbbyTable<AccountRow> = dbbyMemory({dbbyStorage: s("account")})
	const profileTable: DbbyTable<ProfileRow> = dbbyMemory({dbbyStorage: s("profile")})
	const questionTable: DbbyTable<QuestionRow> = dbbyMemory({dbbyStorage: s("question")})
	const liveshowTable: DbbyTable<LiveshowRow> = dbbyMemory({dbbyStorage: s("liveshow")})
	const settingsTable: DbbyTable<SettingsRow> = dbbyMemory({dbbyStorage: s("settings")})
	const premiumGiftTable: DbbyTable<PremiumGiftRow> = dbbyMemory({dbbyStorage: s("premium")})
	const questionLikeTable: DbbyTable<QuestionLikeRow> = dbbyMemory({dbbyStorage: s("questionLike")})
	const stripeBillingTable: DbbyTable<StripeBillingRow> = dbbyMemory({dbbyStorage: s("stripeBilling")})
	const stripePremiumTable: DbbyTable<StripePremiumRow> = dbbyMemory({dbbyStorage: s("stripePremium")})
	const scheduleEventTable: DbbyTable<ScheduleEventRow> = dbbyMemory({dbbyStorage: s("scheduleEvent")})
	const questionReportTable: DbbyTable<QuestionReportRow> = dbbyMemory({dbbyStorage: s("questionReport")})
	const mockStripeTables: MockStripeTables = {
		customers: dbbyMemory({dbbyStorage: s("stripeLiaison-customers")}),
		setupIntents: dbbyMemory({dbbyStorage: s("stripeLiaison-setupIntents")}),
		subscriptions: dbbyMemory({dbbyStorage: s("stripeLiaison-subscriptions")}),
		paymentMethods: dbbyMemory({dbbyStorage: s("stripeLiaison-paymentMethods")}),
	}

	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()

	const authorize: Authorizer<MetalUser> = async(accessToken) => {
		const {user} = await verifyToken<AccessPayload<MetalScope, MetalUser>>(accessToken)
		return user
	}

	const claimsCardinal = makeClaimsCardinal({claimsTable})
	const {authAardvark, userUmbrella} = makeCoreSystems({
		claimsTable,
		accountTable,
		profileTable,
		accessTokenLifespan: minute * 20,
		refreshTokenLifespan: day * 90,
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
		storage: localStorage,
	})

	const questionQuarry = makeQuestionQuarry({
		userUmbrella,
		questionTable,
		questionLikeTable,
		questionReportTable,
		authorize,
		generateId,
		userCanPost: evaluators.isPremium,
		userCanArchiveBoard: evaluators.isStaff,
		userCanArchiveQuestion: (user, authorId) => {
			return (evaluators.isStaff(user) || user.userId === authorId)
		},
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
			signToken,
			verifyToken,
			googleToken,
			authAardvark,
			claimsCardinal,
		},
	}
}
