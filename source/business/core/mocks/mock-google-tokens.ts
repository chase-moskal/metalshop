
import {GoogleResult} from "../../../types.js"

export async function signGoogleToken(googleResult: GoogleResult): Promise<string> {
	return JSON.stringify(googleResult)
}

export async function verifyGoogleToken(googleToken: string): Promise<GoogleResult> {
	return JSON.parse(googleToken)
}
