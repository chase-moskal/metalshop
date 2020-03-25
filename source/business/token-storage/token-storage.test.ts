
// TODO
export const comingSoon = "maybe"

// import {Suite} from "cynic"

// import {
// 	createMockAccessToken,
// 	createMockRefreshToken,
// } from "../../tests/mocks.js"
// import {fn} from "../../tests/testing.js"
// import {TokenStorage} from "./token-storage.js"

// const makeMocks = () => {
// 	const storage = {
// 		length: 0,
// 		key: fn(),
// 		clear: fn(),
// 		getItem: fn(),
// 		setItem: fn(),
// 		removeItem: fn(),
// 	}
// 	const authExchanger = {
// 		authorize: fn(),
// 		authenticateViaGoogle: fn(),
// 	}
// 	const tokenStorage = new TokenStorage({storage, authExchanger})
// 	return {tokenStorage, storage, authExchanger}
// }

// const tenMinutes = 10 * (60 * 1000)

// export default <Suite>{
// 	"writeTokens()": {
// 		"stores tokens in storage": async() => {
// 			const {tokenStorage, storage} = makeMocks()
// 			await tokenStorage.writeTokens({
// 				accessToken: "a123",
// 				refreshToken: "r123",
// 			})
// 			const verifyCall = (k: string, v: any) => !!storage.setItem.mock.calls
// 				.find(({args}) => {
// 					const [key, value] = args
// 					return (key === k) && (value === v)
// 				})
// 			return (
// 				verifyCall("refreshToken", "r123") &&
// 				verifyCall("accessToken", "a123")
// 			)
// 		},
// 	},
// 	"passiveCheck()": {
// 		"return available access token": async() => {
// 			const {tokenStorage, storage} = makeMocks()
// 			const mockAccessToken = await createMockAccessToken({
// 				expiresMilliseconds: tenMinutes
// 			})
// 			const mockRefreshToken = await createMockRefreshToken({
// 				expiresMilliseconds: tenMinutes
// 			})
// 			storage.getItem = fn((key: string) => {
// 				if (key === "refreshToken") return mockRefreshToken
// 				else if (key === "accessToken") return mockAccessToken
// 			})
// 			const accessToken = await tokenStorage.passiveCheck()
// 			return accessToken === mockAccessToken
// 		},
// 		"use refresh token to get new access token": async() => {
// 			const {tokenStorage, storage, authExchanger} = makeMocks()
// 			const mockAccessToken = await createMockAccessToken({
// 				expiresMilliseconds: tenMinutes
// 			})
// 			const mockRefreshToken = await createMockRefreshToken({
// 				expiresMilliseconds: tenMinutes
// 			})
// 			authExchanger.authorize = fn(async() => mockAccessToken)
// 			storage.getItem = fn((key: string) => {
// 				if (key === "refreshToken") return mockRefreshToken
// 				else if (key === "accessToken") return null
// 			})
// 			const accessToken = await tokenStorage.passiveCheck()
// 			return (
// 				(authExchanger.authorize.mock.calls.length > 0)
// 					&&
// 				(authExchanger.authorize.mock.calls[0].args[0].refreshToken
// 				 === mockRefreshToken)
// 					&&
// 				(accessToken === mockAccessToken)
// 					&&
// 				(storage.setItem.mock.calls.length > 0)
// 			)
// 		},
// 		"return null when no tokens are available": async() => {
// 			const {tokenStorage, storage} = makeMocks()
// 			storage.getItem = fn((key: string) => {
// 				if (key === "refreshToken") return null
// 				else if (key === "accessToken") return null
// 			})
// 			const accessToken = await tokenStorage.passiveCheck()
// 			return accessToken === null
// 		},
// 	},
// 	"clearTokens()": {
// 		"tokens are removed from storage": async() => {
// 			const {tokenStorage, storage} = makeMocks()
// 			await tokenStorage.clearTokens()
// 			return (
// 				(storage.removeItem.mock.calls.length === 2)
// 			)
// 		},
// 	},
// }
