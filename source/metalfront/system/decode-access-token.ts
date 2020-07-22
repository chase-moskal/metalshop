
import {tokenDecode} from "redcrypto/dist/token-decode.js"

import {DecodeAccessToken} from "../types.js"
import {AccessPayload, MetalUser, Scope} from "../../types.js"

/**
 * Simply read what's in an access token
 * - no logic to check expiration, or anything like that
 */
export const decodeAccessToken: DecodeAccessToken<MetalUser> = accessToken => {
	const data = tokenDecode<AccessPayload<Scope, MetalUser>>(accessToken)
	const {payload, exp} = data
	const {user} = payload
	return {exp, user, accessToken}
}
