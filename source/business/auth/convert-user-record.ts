
import {User} from "../../interfaces.js"
import {UserRecord} from "./interfaces.js"

export const toUser = ({userId, claims}: UserRecord): User => ({
	claims,
	userId,
})
