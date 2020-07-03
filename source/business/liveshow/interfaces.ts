
import {Topic, AccessToken, User} from "../../interfaces.js"

export interface LiveshowAuthorizers {
	authorizeAccess: (user: User) => boolean
	authorizeControl: (user: User) => boolean
}

export interface LiveshowGovernorTopic extends Topic<LiveshowGovernorTopic> {
	getShow(o: {
			accessToken: AccessToken
			videoName: string
		}): Promise<{vimeoId: string}>
	setShow(o: {
			accessToken: AccessToken
			videoName: string
			vimeoId: string
		}): Promise<void>
}
