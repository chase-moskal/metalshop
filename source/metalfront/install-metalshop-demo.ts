
import {theme} from "./system/theme.js"
import {makeMocks} from "./mocks/make-mocks.js"
import {mockLatency} from "./mocks/mock-latency.js"
import {themeComponents} from "./framework/theme-components.js"
import {assembleSupermodel} from "./startup/assemble-supermodel.js"
import {wireComponentShares } from "./startup/wire-component-shares.js"

import {randomSample} from "../toolbox/random8.js"
import {parseQuery} from "./toolbox/parse-query.js"
import {generateId} from "../toolbox/generate-id.js"
import {hatPuller} from "../toolbox/hat-puller.js"

import {AccessPayload, MetalScope, MetalUser} from "../types.js"

export async function installMetalshopDemo({mockAvatars, nicknameData}: {
		mockAvatars: string[]
		nicknameData: string[][]
	}) {

	const generateAvatar = hatPuller(mockAvatars)

	function generateNickname() {
		return nicknameData
			.map(names => randomSample(Math.random(), names))
			.join(" ")
	}

	const {options, mockeries} = await makeMocks({
		logger: console,
		generateNickname,
		googleUserAvatar: generateAvatar(),
	})

	//
	// starting conditions
	//

	const {
		tokenStore,
		userUmbrella,
		liveshowLizard,
		scheduleSentry,
		questionQuarry,
		settingsSheriff,
		premiumPachyderm,
	} = options
	const {
		signToken,
		verifyToken,
		googleToken,
		authAardvark,
		claimsCardinal,
	} = mockeries

	const minute = 1000 * 60
	const day = minute * 60 * 24

	const {mock = ""} = parseQuery<{mock: string}>()
	const startOpen = mock.includes("open")
	const startAdmin = mock.includes("admin")
	const startStaff = mock.includes("staff")
	const startBanned = mock.includes("banned")
	const startPremium = mock.includes("premium")
	const startLoggedIn = mock.includes("loggedin")

	const mockAdminAccessToken = await signToken<AccessPayload<MetalScope, MetalUser>>({
		payload: {
			scope: {core: true},
			user: {
				userId: generateId(),
				claims: {
					admin: true,
					staff: true,
					banUntil: undefined,
					banReason: undefined,
					premiumUntil: undefined,
					joined: Date.now() - (day * 10),
				},
				profile: {
					avatar: undefined,
					nickname: "Admin Adminisaurus",
					tagline: "doesn't exist",
				},
			}
		},
		lifespan: day * 365,
	})

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

	if (startLoggedIn || startAdmin || startStaff || startPremium || startBanned) {
		const authTokens = await authAardvark.authenticateViaGoogle({googleToken})
		const {accessToken} = authTokens
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId, claims} = user

		if (startAdmin) claims.admin = true
		if (startStaff) claims.staff = true
		if (startBanned) {
			claims.banUntil = Date.now() + (day * 7)
			claims.banReason = "unruly behavior"
		}
		if (startPremium) {
			await premiumPachyderm.checkoutPremium({
				accessToken,
				popupUrl: undefined,
			})
		}

		await claimsCardinal.writeClaims({userId, claims})

		if (startLoggedIn) {
			const {refreshToken} = authTokens
			authTokens.accessToken = await authAardvark.authorize({
				refreshToken,
				scope: {core: true},
			})
			await tokenStore.writeTokens(authTokens)
		}
	}

	const lag = 200
	mockLatency(authAardvark, lag)
	mockLatency(claimsCardinal, lag)
	mockLatency(tokenStore, lag)
	mockLatency(premiumPachyderm, lag)
	mockLatency(userUmbrella, lag)
	mockLatency(scheduleSentry, lag)
	mockLatency(settingsSheriff, lag)
	mockLatency(questionQuarry, lag)
	mockLatency(liveshowLizard, lag)

	//
	// metalshop installation and startup
	//

	const supermodel = assembleSupermodel(options)
	const wiredComponents = wireComponentShares(supermodel)
	const components = themeComponents(theme, wiredComponents)

	if (startOpen) {
		const menuDisplay: any = document.querySelector("menu-display[data-label=account]")
		menuDisplay.toggle()
	}

	return {
		supermodel,
		components,
		async start() {
			await supermodel.auth.useExistingLogin()
		},
	}
}
