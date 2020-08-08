
import {
	GoogleAuthFixed,
	GoogleAuthDetails,
	GoogleAuthClientInterface,
} from "../types.js"

export class GoogleAuthClient implements GoogleAuthClientInterface {
	private _googleAuth: GoogleAuthFixed
	private _googleAuthDetails: GoogleAuthDetails

	constructor(googleAuthDetails: GoogleAuthDetails) {
		this._googleAuthDetails = googleAuthDetails
	}

	async initGoogleAuth(): Promise<void> {
		const {clientId} = this._googleAuthDetails
		this._googleAuth = await new Promise<GoogleAuthFixed>((resolve, reject) => {
			gapi.load("auth2", () => {
				const googleAuth = gapi.auth2.init({
					ux_mode: "redirect",
					client_id: clientId,
					redirect_uri: location.href
				})
				googleAuth.then(
					() => resolve(fixGoogleAuth(googleAuth)),
					problem => reject(problem.error)
				)
			})
		})
	}

	prepareGoogleSignOutButton({button}: {button: HTMLElement}) {
		const googleAuth = this._googleAuth
		const updateLogoutButton = (isSignedIn: boolean) =>
		button.style.display = isSignedIn
			? "block"
			: "none"
		updateLogoutButton(googleAuth.isSignedIn.get())
		googleAuth.isSignedIn.listen(updateLogoutButton)
		button.onclick = () => googleAuth.signOut()
	}

	async prepareGoogleSignInButton(): Promise<gapi.auth2.GoogleUser> {

		// TODO -- perhaps this shouldn't be a promise?
		// it's a coincidence this works as a promise, because the page is refreshed
		// after each login attempt, such that there is never more than one attempt.
		// it might be smarter to allow multiple logins attempts...
		return new Promise<gapi.auth2.GoogleUser>((resolve, reject) => {
			gapi.signin2.render("google-signin", {
				onsuccess: resolve,
				onfailure: reject
			})
		})
	}
}

/**
 * Eliminate google auth object's weird pseudo-promise funny-business
 */
export function fixGoogleAuth(googleAuth: gapi.auth2.GoogleAuth): GoogleAuthFixed {
	const fixedGoogleAuth = Object.create(googleAuth)
	fixedGoogleAuth.then = undefined
	return fixedGoogleAuth
}
