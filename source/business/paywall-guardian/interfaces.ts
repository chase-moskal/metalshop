
import {Topic, AccessToken} from "../../interfaces.js"

export interface PaywallGuardianTopic extends Topic<PaywallGuardianTopic> {

	//
	// card linkage
	//

	makeCardLinkingSession(o: {
		accessToken: AccessToken
	}): Promise<{stripeSessionId: string}>

	unlinkAllCards(o: {
		accessToken: AccessToken
	}): Promise<void>

	//
	// subscriptions
	//

	makeSubscriptionSession(o: {
		stripePlanId: string
		accessToken: AccessToken
	}): Promise<{stripeSessionId: string}>

	setSubscriptionAutoRenew(o: {
		autoRenew: boolean
		accessToken: AccessToken
	}): Promise<void>
}
