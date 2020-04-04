
import {GoogleResult, VerifyGoogleToken} from "./interfaces.js"

export function mockVerifyGoogleToken({googleResult}: {
	googleResult?: GoogleResult
} = {}): VerifyGoogleToken {
	let count = 0
	return async(googleToken: string): Promise<GoogleResult> => googleResult || {
		googleId: `g123456-${count}`,
		name: `Faker McFakerson ${++count}`,
		avatar: "https://picsum.photos/id/375/200/200",
	}
}
