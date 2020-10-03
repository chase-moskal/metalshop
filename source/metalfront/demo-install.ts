
import {theme} from "./system/theme.js"
import {makeMocks} from "./mocks/make-mocks.js"
import {generateMockUser} from "./mocks/generate-mock-user.js"
import {themeComponents} from "./framework/theme-components.js"
import {assembleSupermodel} from "./startup/assemble-supermodel.js"
import {wireComponentShares } from "./startup/wire-component-shares.js"

import {hatPuller} from "../toolbox/hat-puller.js"
import {randomSample} from "../toolbox/random9.js"
import {parseQuery} from "./toolbox/parse-query.js"
import {generateId} from "../toolbox/generate-id.js"

import {MockQuestion} from "./types.js"
import {AccessPayload, MetalScope, MetalUser} from "../types.js"

export async function installDemo({mockAvatars, nicknameData, mockQuestions}: {
		mockAvatars: string[]
		nicknameData: string[][]
		mockQuestions: MockQuestion[]
	}) {

	// get version, and reset on version change
	{
		const packagePath = new URL("../../package.json", import.meta.url).toString()
		const packageFetch = await fetch(packagePath)
		const {version} = await packageFetch.json()
		console.log(`metalshop version: ${version}`)
		const key = "metalshop-version"
		const previousVersion = localStorage.getItem(key)
		if (previousVersion) {
			if (version !== previousVersion) {
				console.log(`new metalshop version (previously ${previousVersion}), wiping storage`)
				localStorage.clear()
				sessionStorage.clear()
			}
		}
		localStorage.setItem(key, version)
	}

	const generateAvatar = hatPuller(mockAvatars)

	function generateNickname() {
		return nicknameData
			.map(names => randomSample(names))
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
		liveshowTopic,
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

		// set demo liveshow
		async() => {
			await liveshowTopic.setShow({
				accessToken: mockAdminAccessToken,
				appToken: undefined,
			}, {
				label: "livestream",
				vimeoId: "109943349",
			})
		},

		// set demo countdown schedule
		async() => {
			await scheduleSentry.setEvent({
				accessToken: mockAdminAccessToken,
				event: {
					label: "countdown1",
					time: Date.now() + (day * 3.14159),
				},
			})
		},

		// create mock questions (create users, post questions, perform likes)
		async() => {
			const board = "qa1"

			// only post questions once per session
			const key = "metalshop-demo-mockusers"
			if (localStorage.getItem(key)) return
			localStorage.setItem(key, "true")

			const units = await Promise.all(mockQuestions.map(async({tagline, content, ban, likes}) => {

				// create each mock user
				const {user, accessToken} = await makeUser({premium: true, tagline})

				// make this user post a question
				const question = await questionQuarry.postQuestion({
					accessToken,
					draft: {board, content},
				})

				// ban the user if that's what's called for
				if (ban) {
					await claimsCardinal.writeClaims({
						userId: user.userId,
						claims: {
							banUntil: Date.now() + (day * ban.days),
							banReason: ban.reason,
						}
					})
				}

				return {user, accessToken, question, likes}
			}))

			// for each user-question pair, perform the likes called for
			await Promise.all(units.map(async({likes, question}) => {

				// randomly select users who will perform each like
				const likerPool = [...units]
				function pluckRandomLiker() {
					if (likerPool.length === 0) return undefined
					const index = Math.floor(Math.random() * likerPool.length)
					const liker = likerPool[index]
					likerPool.splice(index, 1)
					return liker
				}
				const likers = Array.from(Array(likes), () => pluckRandomLiker()).filter(u => !!u)

				// each liker likes the question
				await Promise.all(likers.map(
					({accessToken}) => questionQuarry.likeQuestion({
						accessToken,
						like: true,
						questionId: question.questionId,
					})
				))
			}))
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

		// mock stuff
		options,
		mockeries,

		// standard
		components,
		supermodel,
		async start() {
			await supermodel.auth.useExistingLogin()
		},
	}
}
