
import {
	Topic,
	AuthTokens,
	AccessToken,
	RefreshToken,
} from "../../interfaces.js"

export interface AuthExchangerTopic extends Topic<AuthExchangerTopic> {
	authorize(options: {refreshToken: RefreshToken}): Promise<AccessToken>
	authenticateViaGoogle(options: {googleToken: string}): Promise<AuthTokens>
}
