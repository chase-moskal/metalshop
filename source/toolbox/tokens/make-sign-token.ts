
import {SignToken} from "../../interfaces.js"
import {tokenSign} from "redcrypto/dist/token-sign.js"

export function makeSignToken(privateKey: string): SignToken {
	return async<Payload extends {}>(
		payload: Payload,
		expiresMilliseconds: number
	): Promise<string> => tokenSign({payload, privateKey, expiresMilliseconds})
}
