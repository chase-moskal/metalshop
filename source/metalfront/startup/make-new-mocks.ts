
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
	ClaimsRow,
	MetalUser,
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
	QuestionReportRow,
} from "../../types.js"

import {makeTokenStore} from "../../business/core/token-store.js"
import {makeCoreSystems} from "../../business/core/core-systems.js"
import {mockStorage} from "../../business/core/mocks/mock-storage.js"
import {makeClaimsCardinal} from "../../business/core/claims-cardinal.js"
import {makeLiveshowLizard} from "../../business/liveshow/liveshow-lizard.js"
import {makeScheduleSentry} from "../../business/schedule/schedule-sentry.js"
import {makeQuestionQuarry} from "../../business/questions/question-quarry.js"
import {makeSettingsSheriff} from "../../business/settings/settings-sheriff.js"
import {makePremiumPachyderm} from "../../business/paywall/premium-pachyderm.js"
import {mockStripeCircuit} from "../../business/paywall/mocks/mock-stripe-circuit.js"
import {mockVerifyGoogleToken} from "../../business/core/mocks/mock-verify-google-token.js"

import {nap} from "../toolbox/nap.js"
import {decodeAccessToken as defaultDecodeAccessToken} from "../system/decode-access-token.js"
import {
	MetalOptions,
	DecodeAccessToken,
	TriggerAccountPopup,
	TriggerCheckoutPopup,
} from "../types.js"

export interface DemoScope extends Scope {}
export interface DemoUser extends MetalUser {}
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
		decodeAccessToken?: DecodeAccessToken<DemoUser>
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
				premiumUntil: Date.now() + (day * 30)
			},
			profile: {
				avatar: undefined,
				nickname: "Admin Adminisaurus",
				tagline: "doesn't exist",
			},
		}
	}, day * 365)

	const authorize: Authorizer<DemoUser> = async(accessToken) => {
		const {user} = await verifyToken<DemoAccessPayload>(accessToken)
		return user
	}

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

	const questionQuarry = makeQuestionQuarry({
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

	const liveshowLizard = makeLiveshowLizard({
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
			questionQuarry,
			liveshowLizard,
		})) {
			for (const [key, value] of Object.entries<Method>(object)) {
				object[key] = lag(value)
			}
		}
	}

	return {
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
	}
}
