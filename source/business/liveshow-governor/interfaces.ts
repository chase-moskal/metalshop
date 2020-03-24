
import {Topic, AccessToken} from "../../interfaces.js"

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
