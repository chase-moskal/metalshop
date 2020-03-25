
import {SignToken} from "../../interfaces.js"
import {tokenSign} from "redcrypto/dist/token-sign.js"

export function makeSignToken({privateKey, expiresMilliseconds}: {
	privateKey: string
	expiresMilliseconds: number
}): SignToken {
	return async<Payload extends {}>(payload: Payload): Promise<string> =>
		tokenSign({payload, privateKey, expiresMilliseconds})
}
