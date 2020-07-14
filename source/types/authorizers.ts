
import {User} from "../types.js"

export interface LiveshowAuthorizers<U extends User> {
	authorizeAccess: (user: User) => boolean
	authorizeControl: (user: User) => boolean
}
