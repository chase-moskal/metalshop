
import {User, UserRecord} from "../../interfaces.js"

export const toUser = ({userId, claims}: UserRecord): User => ({
	claims,
	userId,
})
