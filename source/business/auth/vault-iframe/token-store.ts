
import {
	AuthTokens,
	AccessToken,
	TokenStoreTopic,
	AuthExchangerTopic,
} from "../../../interfaces.js"

import {tokenDecode} from "redcrypto/dist/token-decode.js"

const tokenIsValid = (token: string) => {
	if (token) {
		const decoded: any = tokenDecode(token)
		const expired = decoded.exp < (Date.now() / 1000)
		return !expired
	}
	else {
		return false
	}
}

export class TokenStore implements TokenStoreTopic {
	private _storage: Storage
	private _authExchanger: AuthExchangerTopic

	constructor(options: {
		storage: Storage
		authExchanger: AuthExchangerTopic
	}) {
		this._storage = options.storage
		this._authExchanger = options.authExchanger
	}

	async writeAccessToken(accessToken: AccessToken): Promise<void> {
		this._storage.setItem("accessToken", accessToken || "")
	}

	async writeTokens({accessToken, refreshToken}: AuthTokens): Promise<void> {
		this._storage.setItem("accessToken", accessToken || "")
		this._storage.setItem("refreshToken", refreshToken || "")
	}

	async clearTokens(): Promise<void> {
		this._storage.removeItem("accessToken")
		this._storage.removeItem("refreshToken")
	}

	async passiveCheck(): Promise<AccessToken> {
		let accessToken = this._storage.getItem("accessToken")
		let refreshToken = this._storage.getItem("refreshToken")

		const accessValid = tokenIsValid(accessToken)
		const refreshValid = tokenIsValid(refreshToken)

		if (refreshValid) {
			if (!accessValid) {

				// access token missing or expired -- perform a refresh, return access token
				accessToken = await this._authExchanger.authorize({
					refreshToken: refreshToken
				})
				this.writeTokens({refreshToken, accessToken})
			}
		}
		else {

			// refresh token missing or expired -- no login
			accessToken = null
			refreshToken = null
			this.writeTokens({refreshToken, accessToken})
		}

		return accessToken
	}
}
