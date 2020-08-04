
import "menutown/dist/register-all.js"

import {parseQuery} from "./toolbox/parse-query.js"
import {registerComponents} from "./toolbox/register-components.js"
import {demoComponents} from "./components/demos/all-demo-components.js"

import {theme} from "./system/theme.js"
import {makeMocks} from "./startup/make-mocks.js"
import {themeComponents} from "./framework/theme-components.js"
import {mockLatency} from "./startup/mock-latency.js"
import {assembleSupermodel} from "./startup/assemble-supermodel.js"
import {wireComponentShares } from "./startup/wire-component-shares.js"

import {randomSample} from "../toolbox/random8.js"
import {generateId} from "../toolbox/generate-id.js"
import {AccessPayload, MetalScope, MetalUser} from "../types.js"

function generateNickname() {
	const nameData = [
		[
			"Funny",
			"Charming",
			"Wonderful",
			"Fancy",
			"Whimsical",
			"Gregarious",
			"Curious",
			"Fabulous",
			"Winking",
			"Dastardly",
			"Saavy",
			"Groovy",
			"Happy",
			"Snappy",
			"Sneaky",
			"Quick",
			"Super",
			"Fast",
			"Fuzzy",
		],
		[
			"Red",
			"Yellow",
			"Green",
			"Cyan",
			"Blue",
			"Magenta",
			"Dark",
			"Grey",
			"Silver",
			"Bright",
			"Light",
			"Golden",
			"Aqua",
			"Minty",
		],
		[
			"Aardvark",
			"Mongoose",
			"Alligator",
			"Robin",
			"Monkey",
			"Seahorse",
			"Shark",
			"Leopard",
			"Lizard",
			"Eagle",
			"Raven",
			"Owl",
			"Hawk",
			"Duck",
			"Chicken",
			"Wolf",
			"Coyote",
			"Dingo",
			"Ostrich",
			"Llama",
			"Alpaca",
			"Zebra",
			"Bear",
			"Kiwi",
			"Penguin",
			"Weasel",
			"Otter",
			"Dolphin",
			"Starfish",
			"Sunfish",
			"Salmon",
			"Swordfish",
			"Sparrow",
			"Turtle",
		],
	]
	return nameData
		.map(names => randomSample(Math.random(), names))
		.join(" ")
}

function randomAvatar() {
	const urls = [
		// men
		"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=face&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1493106819501-66d381c466f1?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		
		// women
		"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
		"https://images.unsplash.com/photo-1496203695688-3b8985780d6a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop&ixid=eyJhcHBfaWQiOjF9",
	]
	return randomSample(Math.random(), urls)
}

~async function startMetalshopDemo() {
	const {options, mockeries} = await makeMocks({
		logger: console,
		generateNickname,
		googleUserAvatar: randomAvatar(),
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

	await tokenStore.clearTokens()

	if (startLoggedIn || startAdmin || startStaff || startPremium || startBanned) {
		const authTokens = await authAardvark.authenticateViaGoogle({googleToken})
		const {accessToken, refreshToken} = authTokens
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
	registerComponents({
		...components,
		...demoComponents,
	})

	// start
	await supermodel.auth.useExistingLogin()
}()

// ~async function startMetalshopDemo() {
// 	modifyMetalConfigBasedOnQueryParams()

// 	const metalshop = await installMetalshop()
// 	window["metalshop"] = metalshop

// 	registerComponents({
// 		...metalshop.components,
// 		...demoComponents,
// 	})

// 	await metalshop.start()
// }()

// function modifyMetalConfigBasedOnQueryParams() {
// 	const query = parseQuery<{mock: string; dev: string; menu: string}>()
// 	const config = document.querySelector("metal-config")
// 	const attr = (key: string, value: string) => config.setAttribute(key, value)
// 	if (query.mock !== undefined) {
// 		attr("mock", query.mock)
// 		if (query.mock.includes("open")) {
// 			setTimeout(() =>{
// 				document.querySelector<any>(
// 					"menu-system > menu-display:nth-child(1)"
// 				).toggle()
// 			}, 0)
// 		}
// 	}
// 	if (query.dev !== undefined) {
// 		// dev is running minikube local kubernetes cluster in dev mode
// 		if (query.dev === "minikube") {
// 			attr("auth-server", "http://auth.metaldev.chasemoskal.com")
// 			attr("profile-server", "http://profile.metaldev.chasemoskal.com")
// 			attr("questions-server", "http://questions.metaldev.chasemoskal.com")
// 		}
// 		// dev is running each microservice on a different port
// 		else if (query.dev === "node") {
// 			attr("auth-server", "http://auth.metaldev.chasemoskal.com:8000")
// 			attr("profile-server", "http://profile.metaldev.chasemoskal.com:8001")
// 			attr("questions-server", "http://questions.metaldev.chasemoskal.com:8002")
// 		}
// 		// user is connecting to the production kubernetes cluster
// 		else {
// 			attr("auth-server", "https://auth.metalback.chasemoskal.com")
// 			attr("profile-server", "https://profile.metalback.chasemoskal.com")
// 			attr("questions-server", "https://questions.metalback.chasemoskal.com")
// 		}
// 	}
// }
