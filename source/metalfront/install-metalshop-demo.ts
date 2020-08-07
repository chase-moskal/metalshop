
import {theme} from "./system/theme.js"
import {makeMocks} from "./mocks/make-mocks.js"
import {generateMockUser} from "./mocks/generate-mock-user.js"
import {themeComponents} from "./framework/theme-components.js"
import {assembleSupermodel} from "./startup/assemble-supermodel.js"
import {wireComponentShares } from "./startup/wire-component-shares.js"

import {hatPuller} from "../toolbox/hat-puller.js"
import {randomSample} from "../toolbox/random8.js"
import {parseQuery} from "./toolbox/parse-query.js"
import {generateId} from "../toolbox/generate-id.js"

import {AccessPayload, MetalScope, MetalUser} from "../types.js"
import { AccessToken } from "../types/tokens.js"
import { Question } from "../types/business.js"

export async function installMetalshopDemo({mockAvatars, nicknameData, mockQuestionData}: {
		mockAvatars: string[]
		nicknameData: string[][]
		mockQuestionData: {
			contents: [string, string, string, string, string, string],
			taglines: [string, string, string, string, string, string],
		},
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
		googleUserName: generateNickname(),
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
		googleToken,
		authAardvark,
		claimsCardinal,
		signToken,
		verifyToken,
		applyMockLatency,
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

	async function makeUser({premium, tagline}: {
			premium: boolean
			tagline: string
		}) {
		let {user, accessToken, refreshToken} = await generateMockUser({
			authAardvark,
			verifyToken,
			generateAvatar,
		})
		if (premium) {
			await claimsCardinal.writeClaims({
				userId: user.userId,
				claims: {premiumUntil: Date.now() + (day * 30)},
			})
			accessToken = await authAardvark.authorize({scope: {core: true}, refreshToken})
		}
		await userUmbrella.setProfile({
			userId: user.userId,
			accessToken,
			profile: {
				...user.profile,
				tagline,
			},
		})
		return {user, accessToken}
	}

	async function all(funcs: (() => Promise<void>)[]) {
		return Promise.all(funcs.map(f => f()))
	}

	await all([
		async() => {
			await liveshowLizard.setShow({
				label: "livestream",
				vimeoId: "109943349",
				accessToken: mockAdminAccessToken,
			})
		},
		async() => {
			await scheduleSentry.setEvent({
				accessToken: mockAdminAccessToken,
				event: {
					label: "countdown1",
					time: Date.now() + (day * 3.14159),
				},
			})
		},
		async() => {

			// only do once per session
			const key = "metalshop-demo-mockusers"
			if (localStorage.getItem(key)) return
			localStorage.setItem(key, "true")
			const {contents, taglines} = mockQuestionData

			const board = "qa1"
			const users = await Promise.all(taglines.map(tagline => makeUser({premium: true, tagline})))

			async function postQuestion({accessToken}: {accessToken: AccessToken}, content: string) {
				return questionQuarry.postQuestion({
					accessToken: accessToken,
					draft: {board, content},
				})
			}

			async function questionLikes({questionId}: Question, likers: {accessToken: AccessToken}[]) {
				for (const {accessToken} of likers) {
					await questionQuarry.likeQuestion({
						like: true,
						questionId,
						accessToken,
					})
				}
			}

			await claimsCardinal.writeClaims({
				userId: users[4].user.userId,
				claims: {
					banUntil: Date.now() + (day * 14),
					banReason: "posted rude question",
				},
			})

			const questions = await Promise.all(contents.map((content, i) => postQuestion(users[i], content)))

			await Promise.all([
				questionLikes(questions[0], [users[0], users[1], users[2], users[3], users[4]]),
				questionLikes(questions[1], [users[0], users[1], users[2], users[3], users[4]]),
				questionLikes(questions[2], [users[1], users[2], users[3]]),
				questionLikes(questions[3], [users[1]]),
			])
		},
	])

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

	applyMockLatency()

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
		options,
		mockeries,
		supermodel,
		components,
		async start() {
			await supermodel.auth.useExistingLogin()
		},
	}
}
