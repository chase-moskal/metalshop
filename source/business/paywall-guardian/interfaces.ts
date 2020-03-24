
import {Topic, AccessToken, PaypalToken} from "../../interfaces.js"

export interface PaywallGuardianTopic extends Topic<PaywallGuardianTopic> {

	grantUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>

	revokeUserPremium(o: {
		accessToken: AccessToken
		paypalToken: PaypalToken
	}): Promise<AccessToken>
}
