
import {random8} from "../../../toolbox/random8.js"
import {GoogleResult, VerifyGoogleToken} from "../interfaces.js"

export function mockVerifyGoogleToken({googleResult}: {
		googleResult?: GoogleResult
	} = {}): VerifyGoogleToken {
	return async(googleToken: string): Promise<GoogleResult> => googleResult || {
		googleId: `mock-google-id-${random8()}`,
		name: `Mock Person ${random8()}`,
		avatar: "https://picsum.photos/id/375/200/200",
	}
}
