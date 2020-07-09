
import {
	User,
	AccountRow,
} from "../types.js"

//
// auth
//

export interface GoogleResult {
	name: string
	avatar: string
	googleId: string
}

export type VerifyGoogleToken = (googleToken: string) => Promise<GoogleResult>

export interface UserDatalayer {
	getUser(o: {
			userId: string
		}): Promise<User>
	assertUser(o: {
			avatar: string
			accountRow: AccountRow
		}): Promise<User>
}
