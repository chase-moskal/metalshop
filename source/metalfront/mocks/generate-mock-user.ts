
import {VerifyToken} from "redcrypto/dist/types.js"

import {generateId} from "../../toolbox/generate-id.js"
import {mockSignGoogleToken} from "../../business/core/mocks/mock-google-tokens.js"

import {AuthAardvarkTopic, AccessPayload, MetalScope, MetalUser} from "../../types.js"

export async function generateMockUser({authAardvark, verifyToken, generateAvatar}: {
		authAardvark: AuthAardvarkTopic
		verifyToken: VerifyToken
		generateAvatar: () => string
	}) {

	const googleToken = await mockSignGoogleToken({
		name,
		googleId: generateId(),
		avatar: generateAvatar(),
	})

	const {accessToken, refreshToken} = await authAardvark.authenticateViaGoogle({googleToken})

	const {user} = await verifyToken<AccessPayload<MetalScope, MetalUser>>(accessToken)
	return {user, accessToken, refreshToken}
}
