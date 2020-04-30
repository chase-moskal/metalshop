
import {Topic, AuthTokens} from "../../../interfaces.js"

export interface AccountPopupTopic extends Topic<AccountPopupTopic> {
	login(): Promise<AuthTokens>
}
