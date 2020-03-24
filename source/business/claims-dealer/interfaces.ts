
import {Topic, User} from "../../interfaces.js"

export interface ClaimsDealerTopic extends Topic<ClaimsDealerTopic> {
	getUser(o: {userId: string}): Promise<User>
}
