
import {LiveshowAuthorizers} from "../../interfaces.js"

export function makeLiveshowAuthorizers(): LiveshowAuthorizers {
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
