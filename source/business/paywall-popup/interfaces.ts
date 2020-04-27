
import {Topic, User} from "../../interfaces.js"

export enum PaywallPopupState {
	Initial,
	Done,
}

export interface PaywallPopupTopic extends Topic<PaywallPopupTopic> {
	subscribe(options: {userId: string}): Promise<User>
}

export interface PaywallPopupParameters {
	stripeSessionId: string
}

export interface PaywallPopupPayload {}
