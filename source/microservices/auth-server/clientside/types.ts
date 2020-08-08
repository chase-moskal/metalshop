
import {CorsConfig} from "../../../types.js"

export interface AccountConfig {
	cors: CorsConfig
}

export interface VaultSettings {
	cors: CorsConfig
}

export interface AccountSettings extends AccountConfig {
	debug: boolean
	googleAuthDetails: GoogleAuthDetails
}

export interface GoogleAuthDetails {
	clientId: string
}

export interface GoogleAuthFixed extends gapi.auth2.GoogleAuth {
	then: undefined
}

export interface GoogleAuthClientInterface {
	initGoogleAuth(): Promise<void>
	prepareGoogleSignInButton(): Promise<gapi.auth2.GoogleUser>
	prepareGoogleSignOutButton(options: {button: HTMLElement}): void
}
