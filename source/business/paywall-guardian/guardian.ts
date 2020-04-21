
import {Stripe} from "../../commonjs/stripe.js"
import {AuthVanguardTopic} from "../auth-api/interfaces.js"
import {User, AccessToken, AccessPayload, PaywallGuardianTopic, VerifyToken} from "../../interfaces.js"

export function makePaywallGuardian({
	stripe, verifyToken, authVanguard, popupUrl, premiumStripePlanId
}: {
	stripe: Stripe
	popupUrl: string
	verifyToken: VerifyToken
	premiumStripePlanId: string
	authVanguard: AuthVanguardTopic
}): PaywallGuardianTopic {

	//
	// internal functionality
	//

	async function setPremiumAutoRenew({user, autoRenew}: {
		user: User
		autoRenew: boolean
	}) {
		const {userId, claims} = user
		claims.premium.autoRenew = autoRenew
		await authVanguard.setClaims({userId, claims})
	}

	async function setSubscriptionCancellation({
		autoRenew,
		stripeSubscriptionId
	}: {
		autoRenew: boolean
		stripeSubscriptionId: string
	}) {
		await stripe.subscriptions.update(stripeSubscriptionId, {
			cancel_at_period_end: !autoRenew
		})
	}

	async function deleteAllPaymentSources({customerId}: {
		customerId: string
	}) {
		const list = await stripe.customers.listSources(customerId)
		await Promise.all(list.data.map(async source => {
			await stripe.customers.deleteSource(customerId, source.id)
		}))
	}

	const internal = {
		authoritarian: {
			setPremiumAutoRenew,
		},
		stripe: {
			deleteAllPaymentSources,
			setSubscriptionCancellation,
		},
	}

	//
	// public functionality
	//

	/**
	 * create a stripe card-linking checkout session
	 * - frontend launches stripe checkout popup with the session id
	 */
	async function makeCardLinkingSession({accessToken}: {
		accessToken: AccessToken
	}): Promise<{stripeSessionId: string}> {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId} = user
		const session = await stripe.checkout.sessions.create({
			mode: "setup",
			client_reference_id: userId,
			payment_method_types: ["card"],
			cancel_url: `${popupUrl}#cancel`,
			success_url: `${popupUrl}#success`,
		})
		return {stripeSessionId: session.id}
	}

	/**
	 * make a stripe session for the purchase of a subscription
	 * - save card details for later, much like card linking
	 */
	async function makeSubscriptionSession({accessToken}: {
		stripePlanId: string
		accessToken: AccessToken
	}): Promise<{
		stripeSessionId: string
	}> {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId} = user
		const session = await stripe.checkout.sessions.create({
			mode: "setup",
			client_reference_id: userId,
			payment_method_types: ["card"],
			cancel_url: `${popupUrl}#cancel`,
			success_url: `${popupUrl}#success`,
			subscription_data: {items: [{plan: premiumStripePlanId}]},
		})
		return {stripeSessionId: session.id}
	}

	/**
	 * delete all payment sources, and end subscription
	 */
	async function unlinkAllCards({accessToken}: {
		accessToken: AccessToken
	}): Promise<void> {

		// freshly fetch our user's data
		const accessPayload = await verifyToken<AccessPayload>(accessToken)
		const {userId} = accessPayload.user
		const user = await authVanguard.getUser({userId})
		const customerId = user.claims.stripe?.customerId
		const stripeSubscriptionId = user.claims.premium?.stripeSubscriptionId

		// cancel stripe subscription
		if (stripeSubscriptionId) {
			await internal.stripe.setSubscriptionCancellation({
				autoRenew: false,
				stripeSubscriptionId,
			})
		}

		// delete all stripe payment sources
		await internal.stripe.deleteAllPaymentSources({customerId})

		// cancel our user's premium
		await internal.authoritarian.setPremiumAutoRenew({user, autoRenew: false})
	}

	/**
	 * cancel or uncancel a subscription
	 */
	async function setSubscriptionAutoRenew({autoRenew, accessToken}: {
		autoRenew: boolean
		accessToken: AccessToken
	}): Promise<void> {
		const accessPayload = await verifyToken<AccessPayload>(accessToken)
		const {userId} = accessPayload.user
		const user = await authVanguard.getUser({userId})
		if (!user.claims.premium) throw new Error("user is not premium")

		const {stripeSubscriptionId} = user.claims.premium

		// update the stripe subscription's cancellation policy
		await stripe.subscriptions.update(stripeSubscriptionId, {
			cancel_at_period_end: !autoRenew
		})

		// update our user's premium autoRenew claim
		await internal.authoritarian.setPremiumAutoRenew({user, autoRenew})
	}

	return {
		unlinkAllCards,
		makeCardLinkingSession,
		makeSubscriptionSession,
		setSubscriptionAutoRenew,
	}
}
