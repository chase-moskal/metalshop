
import {GoogleResult, VerifyGoogleToken} from "./interfaces.js"
import {OAuth2Client} from "../../commonjs/google-auth-library.js"

export function makeVerifyGoogleToken({googleClientId}: {
	googleClientId: string
}): VerifyGoogleToken {
	const oAuth2Client = new OAuth2Client(googleClientId)
	return async(googleToken: string): Promise<GoogleResult> => {
		const ticket = await oAuth2Client.verifyIdToken({
			idToken: googleToken,
			audience: googleClientId
		})
	
		const payload = ticket.getPayload()
		const googleId = payload.sub
		const {picture: avatar, name} = payload
	
		return {googleId, avatar, name}
	}
}
