
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {DbbyTable} from "../../toolbox/dbby/types.js"
import {Logger} from "../../toolbox/logger/interfaces.js"
import {dbbyMemory} from "../../toolbox/dbby/dbby-memory.js"
import {generateId as defaultGenerateId} from "../../toolbox/generate-id.js"

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

import {makeTokenStore} from "../../business/core/token-store.js"
import {makeCoreSystems} from "../../business/core/core-systems.js"
import * as evaluators from "../../business/core/user-evaluators.js"
import {mockStorage} from "../../business/core/mocks/mock-storage.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {makeLiveshowLizard} from "../../business/liveshow/liveshow-lizard.js"
import {makeScheduleSentry} from "../../business/schedule/schedule-sentry.js"
import {makeQuestionQuarry} from "../../business/questions/question-quarry.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {verifyGoogleToken, signGoogleToken} from "../../business/core/mocks/mock-google-tokens.js"

import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"
import {
	MetalOptions,
	DecodeAccessToken,
	TriggerAccountPopup,
	TriggerCheckoutPopup,
} from "../types.js"

export type PrepareMockData = (options: {
		authAardvark: AuthAardvarkTopic,
		questionQuarry: QuestionQuarryTopic,
		premiumPachyderm: PremiumPachydermTopic,
		userUmbrella: UserUmbrellaTopic<MetalUser>,
	}) => Promise<void>

export async function makeMocks({
		logger = console,
		generateId = defaultGenerateId,
		googleUserName = "Steve Stephenson",
		generateNickname = defaultGenerateId,
		decodeAccessToken = defaultDecodeAccessToken,
		googleUserAvatar = "https://i.imgur.com/CEqYyCy.jpg",
	}: {
		logger: Logger
		googleUserName?: string
		googleUserAvatar?: string
		generateId?: () => string
		generateNickname?: () => string
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

	const claimsTable: DbbyTable<ClaimsRow> = dbbyMemory()
	const accountTable: DbbyTable<AccountRow> = dbbyMemory()
	const profileTable: DbbyTable<ProfileRow> = dbbyMemory()
	const questionTable: DbbyTable<QuestionRow> = dbbyMemory()
	const liveshowTable: DbbyTable<LiveshowRow> = dbbyMemory()
	const settingsTable: DbbyTable<SettingsRow> = dbbyMemory()
	const premiumGiftTable: DbbyTable<PremiumGiftRow> = dbbyMemory()
	const questionLikeTable: DbbyTable<QuestionLikeRow> = dbbyMemory()
	const stripeBillingTable: DbbyTable<StripeBillingRow> = dbbyMemory()
	const stripePremiumTable: DbbyTable<StripePremiumRow> = dbbyMemory()
	const scheduleEventTable: DbbyTable<ScheduleEventRow> = dbbyMemory()
	const questionReportTable: DbbyTable<QuestionReportRow> = dbbyMemory()

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
		storage: mockStorage(),
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
