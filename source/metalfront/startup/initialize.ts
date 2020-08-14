
import {MetalUser} from "../../types.js"
import {MetalConfig, MetalOptions} from "../types.js"

import {openVaultIframe} from "../../business/core/vault-popup/open-vault-iframe.js"
import {openAccountPopup} from "../../business/core/account-popup/open-account-popup.js"
import {openCheckoutPopup} from "../../business/paywall/checkout-popup/open-checkout-popup.js"

import {makeCoreSystemsClients} from "../../business/core/core-clients.js"
import {makePaywallClients} from "../../business/paywall/paywall-clients.js"
import {makeScheduleClients} from "../../business/schedule/schedule-clients.js"
import {makeSettingsClients} from "../../business/settings/settings-clients.js"
import {makeLiveshowClients} from "../../business/liveshow/liveshow-clients.js"
import {makeQuestionsClients} from "../../business/questions/questions-clients.js"

import {concurrent} from "../../toolbox/concurrent.js"
import {makeLogger} from "../../toolbox/logger/make-logger.js"
import {decodeAccessToken} from "../system/decode-access-token.js"

export async function initialize(config: MetalConfig): Promise<MetalOptions> {
	const logger = makeLogger()

	const checkoutPopupUrl = `${config["paywall-server"]}/checkout`

	async function triggerAccountPopup() {
		const {promisedPayload} = openAccountPopup({
			authServerOrigin: config["core-server"]
		})
		return promisedPayload
	}

	async function triggerCheckoutPopup({stripeSessionId}: {stripeSessionId: string}) {
		openCheckoutPopup({
			stripeSessionId,
			paywallServerOrigin: config["paywall-server"],
		})
	}

	try {
		const {
			tokenStore,
			userUmbrella,
			liveshowLizard,
			questionQuarry,
			scheduleSentry,
			settingsSheriff,
			premiumPachyderm,
		} = await concurrent({
			tokenStore: (async function() {
				const {tokenStore} = await openVaultIframe({
					coreServerOrigin: config["core-server"],
				})
				return tokenStore
			})(),
			userUmbrella: (async function() {
				const {userUmbrella} = await makeCoreSystemsClients<MetalUser>({
					coreServerOrigin: config["core-server"],
				})
				return userUmbrella
			})(),
			liveshowLizard: (async function() {
				const {liveshowLizard} = await makeLiveshowClients({
					liveshowServerOrigin: config["liveshow-server"],
				})
				return liveshowLizard
			})(),
			questionQuarry: (async function() {
				const {questionQuarry} = await makeQuestionsClients({
					questionsServerOrigin: config["questions-server"],
				})
				return questionQuarry
			})(),
			scheduleSentry: (async function() {
				const {scheduleSentry} = await makeScheduleClients({
					scheduleServerOrigin: config["schedule-server"],
				})
				return scheduleSentry
			})(),
			settingsSheriff: (async function() {
				const {settingsSheriff} = await makeSettingsClients({
					settingsServerOrigin: config["settings-server"],
				})
				return settingsSheriff
			})(),
			premiumPachyderm: (async function() {
				const {premiumPachyderm} = await makePaywallClients({
					paywallServerOrigin: config["paywall-server"],
				})
				return premiumPachyderm
			})(),
		})
		return {
			logger,
			tokenStore,
			userUmbrella,
			liveshowLizard,
			questionQuarry,
			scheduleSentry,
			settingsSheriff,
			premiumPachyderm,
			checkoutPopupUrl,
			decodeAccessToken,
			triggerAccountPopup,
			triggerCheckoutPopup,
		}
	}
	catch (error) {
		error.name = "MetalshopStartupError"
		error.message = `initialization error: ${error.message}`
		throw error
	}
}
