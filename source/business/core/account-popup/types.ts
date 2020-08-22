
import {Topic, AuthTokens} from "../../../types.js"

export const namespace = "authoritarian-account"

export interface AccountPopupTopic extends Topic {
	login(): Promise<AuthTokens>
}
