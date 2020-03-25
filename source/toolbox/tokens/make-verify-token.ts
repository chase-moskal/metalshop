
import {VerifyToken} from "../../interfaces.js"
import {tokenVerify} from "redcrypto/dist/token-verify.js"

export function makeVerifyToken(publicKey: string): VerifyToken {
	return async<Payload extends {}>(token: string): Promise<Payload> => {
		const tokenData = await tokenVerify<Payload>({token, publicKey})
		return tokenData.payload
	}
}
