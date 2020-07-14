
import {LiveshowAuthorizers, User} from "../../types.js"

export function makeLiveshowAuthorizers<U extends User>(): LiveshowAuthorizers<U> {
	return {
		authorizeAccess: user => (false
				|| !!user.claims.premium
				|| !!user.claims.admin
				|| !!user.claims.staff
			),
		authorizeControl: user => (false
				|| !!user.claims.admin
				|| !!user.claims.staff
			),
	}
}
