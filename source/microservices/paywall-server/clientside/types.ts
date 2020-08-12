
import {CorsConfig} from "../../../types.js"

export interface CheckoutPopupSettings {
	cors: CorsConfig
	stripeApiKey: string
	premiumStripePlanId: string
}
