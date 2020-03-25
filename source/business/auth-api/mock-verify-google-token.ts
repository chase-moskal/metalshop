
import {GoogleResult, VerifyGoogleToken} from "./interfaces.js"

export function mockVerifyGoogleToken(): VerifyGoogleToken {
	let count = 0
	return async(googleToken: string): Promise<GoogleResult> => ({
		googleId: `g123456-${count}`,
		name: `Faker McFakerson ${++count}`,
		avatar: "https://picsum.photos/id/375/200/200",
	})
}
