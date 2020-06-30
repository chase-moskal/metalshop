
import {User} from "../../interfaces.js"

export function isUserAdmin(user: User): boolean {
	return !!user.claims.admin
}
