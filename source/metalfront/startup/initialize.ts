
import {MetalConfig, MetalOptions} from "../types.js"
import {MetalUser, CoreSystemsApi} from "../../types.js"

import {openVaultIframe} from "../../business/core/vault-popup/open-vault-iframe.js"
import {openAccountPopup} from "../../business/core/account-popup/open-account-popup.js"
import {openCheckoutPopup} from "../../business/paywall/checkout-popup/open-checkout-popup.js"

import {makeCoreSystemsClients} from "../../business/core/core-clients.js"
import {makePaywallClients} from "../../business/paywall/paywall-clients.js"
import {makeScheduleClients} from "../../business/schedule/schedule-clients.js"
import {makeSettingsClients} from "../../business/settings/settings-clients.js"
import {makeLiveshowClients} from "../../business/liveshow/liveshow-clients.js"
import {makeQuestionsClients} from "../../business/questions/questions-clients.js"

import {AuthoritarianStartupError} from "../system/errors.js"
import {makeLogger} from "../../toolbox/logger/make-logger.js"
import {decodeAccessToken} from "../system/decode-access-token.js"

const err = (message: string) => new AuthoritarianStartupError(message)

export async function initialize(config: MetalConfig): Promise<MetalOptions> {
	let options: Partial<MetalOptions> = {}
	options.logger = makeLogger()
	options.decodeAccessToken = decodeAccessToken

	//
	// use mocks instead of real microservices
	//

	// if (config.mock !== null) {
	// 	const {makeMocks} = await import("./make-mocks.js")
	// 	options = await makeMocks({
	// 		logger: options.logger,
	// 		startAdmin: config.mock?.includes("admin"),
	// 		startStaff: config.mock?.includes("staff"),
	// 		startBanned: config.mock?.includes("banned"),
	// 		startPremium: config.mock?.includes("premium"),
	// 		startLoggedIn: config.mock?.includes("loggedin"),
	// 	})
	// }

	//
	// use real microservices, overwriting mocks
	//

	const operations = []
	const queue = (func: () => Promise<any>) => operations.push(func())
	const {
		["core-server"]: coreServerOrigin,
		["paywall-server"]: paywallServerOrigin,
		["settings-server"]: settingsServerOrigin,
		["liveshow-server"]: liveshowServerOrigin,
		["schedule-server"]: scheduleServerOrigin,
		["questions-server"]: questionsServerOrigin,
	} = config

	if (coreServerOrigin) {
		queue(async() => {
			const {userUmbrella} = <CoreSystemsApi<MetalUser>>await makeCoreSystemsClients({coreServerOrigin})
			options.userUmbrella = userUmbrella
			options.triggerAccountPopup = async() => {
				const {promisedPayload} = openAccountPopup({
					authServerOrigin: coreServerOrigin
				})
				return promisedPayload
			}
			const {tokenStore} = await openVaultIframe({coreServerOrigin})
			options.tokenStore = tokenStore
		})
	}

	if (questionsServerOrigin) {
		queue(async() => {
			const {questionQuarry} = await makeQuestionsClients({questionsServerOrigin})
			options.questionQuarry = questionQuarry
		})
	}

	if (scheduleServerOrigin) {
		queue(async() => {
			const {scheduleSentry} = await makeScheduleClients({scheduleServerOrigin})
			options.scheduleSentry = scheduleSentry
		})
	}

	if (settingsServerOrigin) {
		queue(async() => {
			const {settingsSheriff} = await makeSettingsClients({settingsServerOrigin})
			options.settingsSheriff = settingsSheriff
		})
	}

	if (paywallServerOrigin) {
		queue(async() => {
			console.log("coming soon: paywall initialization!")
			options.triggerCheckoutPopup = async({stripeSessionId}: {
					stripeSessionId: string
				}) => {
				openCheckoutPopup({
					stripeSessionId,
					paywallServerOrigin,
				})
			}
			const {premiumPachyderm} = await makePaywallClients({paywallServerOrigin})
			options.checkoutPopupUrl = `${paywallServerOrigin}/html/checkout`
			options.premiumPachyderm = premiumPachyderm
		})
	}

	if (liveshowServerOrigin) {
		queue(async() => {
			console.log("coming soon: liveshow initialization")
			const {liveshowLizard} = await makeLiveshowClients({liveshowServerOrigin})
			options.liveshowLizard = liveshowLizard
		})
	}

	try {
		await Promise.all(operations)
	}
	catch (error) {
		console.error(err(error.message))
	}

	return {
		logger: options.logger,
		tokenStore: options.tokenStore,
		userUmbrella: options.userUmbrella,
		liveshowLizard: options.liveshowLizard,
		questionQuarry: options.questionQuarry,
		scheduleSentry: options.scheduleSentry,
		settingsSheriff: options.settingsSheriff,
		premiumPachyderm: options.premiumPachyderm,
		////////
		checkoutPopupUrl: options.checkoutPopupUrl,
		decodeAccessToken: options.decodeAccessToken,
		triggerAccountPopup: options.triggerAccountPopup,
		triggerCheckoutPopup: options.triggerCheckoutPopup,
	}
}
