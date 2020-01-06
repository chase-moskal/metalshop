
import {AccountPopupMessage} from "../interfaces.js"

export const namespace = "authoritarian-account-popup"

export class AccountPopupError extends Error {
	readonly name = this.constructor.name
}

export const err = (message: string) => new AccountPopupError(message)

export function isRelevant(message: AccountPopupMessage) {
	return (
		message
			&&
		message.namespace === namespace
	)
}
