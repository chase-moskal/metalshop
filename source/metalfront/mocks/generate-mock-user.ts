
import {VerifyToken} from "redcrypto/dist/types.js"

import {mockSignGoogleToken} from "../../business/auth/mocks/mock-google-tokens.js"
import {AuthAardvarkTopic, AccessPayload, MetalScope, MetalUser} from "../../types.js"

export async function generateMockUser({
		authAardvark,
		verifyToken,
		generateId,
		generateAvatar,
	}: {
		authAardvark: AuthAardvarkTopic
		verifyToken: VerifyToken
		generateId: () => string
		generateAvatar: () => string
	}) {

	const googleToken = await mockSignGoogleToken({
		name,
		googleId: generateId(),
		avatar: generateAvatar(),
	})

	const {
		accessToken,
		refreshToken,
	} = await authAardvark.authenticateViaGoogle({googleToken})

	const {user} = await verifyToken<
		AccessPayload<MetalScope, MetalUser>
	>(accessToken)

	return {user, accessToken, refreshToken}
}
