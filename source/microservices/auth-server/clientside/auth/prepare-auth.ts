
import {GoogleAuthDetails} from "../types.js"
import {GoogleAuthClient} from "./google-auth-client.js"
import {makeAuthClients} from "../../../../business/auth/auth-clients.js"

export function prepareAuth(googleAuthDetails: GoogleAuthDetails) {
	return async function auth() {
		const googleAuthClient = new GoogleAuthClient(googleAuthDetails)
		const {authAardvark} = await makeAuthClients({
			authServerOrigin: window.location.origin
		})
		await googleAuthClient.initGoogleAuth()
		googleAuthClient.prepareGoogleSignOutButton({
			button: document.querySelector<HTMLDivElement>("#google-signout")
		})
		const googleUser = await googleAuthClient.prepareGoogleSignInButton()
		const googleToken = googleUser.getAuthResponse().id_token
		const tokens = await authAardvark.authenticateViaGoogle({googleToken})
		return tokens
	}
}
