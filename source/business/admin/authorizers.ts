
import {User} from "../../interfaces.js"

export const authorizeForStats = (user: User) => (false
	|| !!user.claims.admin
	|| !!user.claims.staff
)
