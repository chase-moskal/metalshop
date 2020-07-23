
import {tokenDecode} from "redcrypto/dist/token-decode.js"
import {TokenStoreTopic, AuthAardvarkTopic} from "../../types.js"

const tokenIsValid = (token: string) => {
	let valid = false
	if (token) {
		const decoded: any = tokenDecode(token)
		const expired = decoded.exp < (Date.now() / 1000)
		valid = !expired
	}
	return valid
}

export function makeTokenStore({
		storage,
		authAardvark,
	}: {
		storage: Storage
		authAardvark: AuthAardvarkTopic
	}): TokenStoreTopic {

	function saveTokens({accessToken, refreshToken}) {
		storage.setItem("accessToken", accessToken || "")
		storage.setItem("refreshToken", refreshToken || "")
	}

	return {

		async writeTokens({accessToken, refreshToken}) {
			saveTokens({accessToken, refreshToken})
		},

		async writeAccessToken(accessToken) {
			storage.setItem("accessToken", accessToken || "")
		},

		async clearTokens() {
			storage.removeItem("accessToken")
			storage.removeItem("refreshToken")
		},

		async passiveCheck() {
			let accessToken = storage.getItem("accessToken")
			let refreshToken = storage.getItem("refreshToken")

			const accessValid = tokenIsValid(accessToken)
			const refreshValid = tokenIsValid(refreshToken)

			if (refreshValid) {
				if (!accessValid) {

					// access token missing or expired -- perform a refresh
					accessToken = await authAardvark.authorize({
						refreshToken,
						scope: {core: true},
					})

					saveTokens({accessToken, refreshToken})
				}
			}
			else {

				// refresh token missing or expired -- no login
				accessToken = null
				refreshToken = null
				saveTokens({refreshToken, accessToken})
			}

			return accessToken
		},
	}
}
