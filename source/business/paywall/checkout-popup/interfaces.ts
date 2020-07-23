
import {Topic, User} from "../../../types.js"

export enum CheckoutPopupState {
	Initial,
	Done,
}

export interface CheckoutPopupTopic extends Topic<CheckoutPopupTopic> {
	subscribe(options: {userId: string}): Promise<User>
}

export interface CheckoutPopupParameters {
	stripeSessionId: string
}

export interface CheckoutPopupPayload {}
