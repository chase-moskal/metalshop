
import {Topic, User} from "../../../types.js"

export const namespace = "authoritarian-checkout-popup"

export enum CheckoutPopupState {
	Initial,
	Done,
}

export interface CheckoutPopupTopic extends Topic {
	subscribe(options: {userId: string}): Promise<User>
}

export interface CheckoutPopupParameters {
	stripeSessionId: string
}

export interface CheckoutPopupPayload {}
