
import {Topic, AuthTokens} from "../../../types.js"

export interface AccountPopupTopic extends Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}
