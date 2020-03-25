
import {SignToken} from "../../interfaces.js"

export function mockSignToken({privateKey, expiresMilliseconds}: {
	privateKey: string
	expiresMilliseconds: number
}): SignToken {
	return async<Payload extends {}>(payload: Payload): Promise<string> => {
		// TODO make fake tokens
		throw new Error("TODO: MAKE A FAKE TOKEN WITH A BROKEN SIGNATURE")
	}
}
