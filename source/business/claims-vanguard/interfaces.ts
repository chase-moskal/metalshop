
import {Topic, User, Claims} from "../../interfaces.js"

export interface ClaimsVanguardTopic extends Topic<ClaimsVanguardTopic> {
	createUser(o: {googleId: string}): Promise<User>
	setClaims(o: {userId: string; claims: Claims}): Promise<User>
}
