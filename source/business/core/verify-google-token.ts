
import {GoogleResult, VerifyGoogleToken} from "./types.js"
import {OAuth2Client} from "../../commonjs/google-auth-library.js"

export function curryVerifyGoogleToken(
		googleClientId: string
	): VerifyGoogleToken {

	const oAuth2Client = new OAuth2Client(googleClientId)

	return async(googleToken: string): Promise<GoogleResult> => {
		const ticket = await oAuth2Client.verifyIdToken({
			idToken: googleToken,
			audience: googleClientId
		})
		const payload = ticket.getPayload()
		return {
			googleId: payload.sub,
			avatar: payload.picture,
			name: payload.name,
		}
	}
}
