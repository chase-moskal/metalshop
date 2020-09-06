
import * as evaluators from "../../business/auth/user-evaluators.js"

import {mixinStyles} from "../framework/mixin-styles.js"
import {MetalshopComponent, html, property, css} from "../framework/metalshop-component.js"

import {select} from "../toolbox/selects.js"
import {formatDate} from "../toolbox/dates.js"
import * as loading from "../toolbox/loading.js"
import {makeDebouncer} from "../toolbox/debouncer.js"
import {deepClone, deepEqual} from "../toolbox/deep.js"

import {MetalUser, MetalProfile} from "../../types.js"
import {nicknameMax, taglineMax} from "../../business/auth/validate-profile.js"

const styles = css`

.cardplate > * {
	display: block;
}

.cardplate > * + * {
	margin-top: 0.4rem;
}

.claims {
	list-style: none;
	font-size: 0.6em;
	cursor: default;
}

.claims > li {
	display: inline-block;
	margin: 0 0.1em;
	padding: 0 0.25em;
	border: 1px solid;
	border-radius: 1em;
}

[data-tag=staff] {
	color: var(--cobalt-tagcolor-staff, lime);
}

[data-tag=banned] {
	color: var(--cobalt-tagcolor-banned, red);
}

.textfield {
	display: block;
	width: 100%;
}

iron-text-input {
	display: block;
}

.tagline {
	font-style: italic;
}

.tagline[readonly] {
	opacity: 0.8;
	font-size: 0.8em;
}

.tagline.value-present::before,
.tagline.value-present::after {
	content: '"';
}

.detail {
	opacity: 0.5;
	font-size: 0.7em;
	list-style: none;
}

.buttonbar {
	margin-top: 1rem;
	text-align: right;
}

`

 @mixinStyles(styles)
export class CobaltCard extends MetalshopComponent<void> {

	 @property({type: Object})
	user?: MetalUser

	 @property({type: Object})
	saveProfile?: (profile: MetalProfile) => Promise<void>

	 @property({type: Boolean})
	private busy: boolean = false

	 @property({type: Object})
	private changedProfile: MetalProfile = null

	private get readonly() {
		return !this.saveProfile
	}

	private generateNewProfileFromInputs(): MetalProfile {
		const {profile} = this.user
		const clonedProfile = deepClone(profile)
		const getValue = (name: string) => select<HTMLInputElement>(
			`iron-text-input.${name}`,
			this.shadowRoot,
		).value
		clonedProfile.nickname = getValue("nickname")
		clonedProfile.tagline = getValue("tagline")
		return clonedProfile
	}

	private handleChange = () => {
		if (!this.user) return
		const {profile} = this.user
		const newProfile = this.generateNewProfileFromInputs()
		const changes = !deepEqual(profile, newProfile)
		this.changedProfile = changes ? newProfile : null
	}

	private inputDebouncer = makeDebouncer({
		delay: 200,
		action: () => this.handleChange()
	})

	private renderClaimsList(user: MetalUser) {
		const {readonly} = this

		const renderTag = (tag: string, title?: string) =>
			html`<li data-tag=${tag} title=${title || ""}>${tag}</li>`

		let items = []
		if (evaluators.isBanned(user)) items.push(renderTag(
			"banned",
			`banned until ${formatDate(user.claims.banUntil).datestring}, reason: ${user.claims.banReason}`
		))
		if (evaluators.isStaff(user)) items.push(renderTag("staff"))
		if (evaluators.isPremium(user)) items.push(renderTag(
			"premium",
			readonly
				? undefined
				: `premium until ${formatDate(user.claims.premiumUntil).datestring}`
		))

		return items.length
			? html`<ol class="claims">${items}</ol>`
			: null
	}

	private renderTextfield(name: string, value: string, maxlength: number) {
		const {readonly} = this
		if (readonly && !value) return null
		return html`
			<iron-text-input
				class=${name}
				maxlength=${maxlength}
				.value=${value}
				?nolabel=${readonly}
				?readonly=${readonly}
				@textchange=${this.inputDebouncer.queue}>
					${name}
			</iron-text-input>
		`
	}

	private handleSave = async() => {
		const {changedProfile} = this
		this.busy = true
		this.changedProfile = null
		try {
			await this.saveProfile(changedProfile)
		}
		finally {
			this.busy = false
		}
	}

	render() {
		const {user, busy} = this
		if (!user) return null
		const {userId, profile, claims} = user
		const load = busy ? loading.loading() : loading.ready()
		const joinedDate = formatDate(claims.joined).datestring
		return html`
			<iron-loading .load=${load} class="cardplate formarea coolbuttonarea">
				<div class=textfields>
					${this.renderTextfield("nickname", profile.nickname, nicknameMax)}
					${this.renderTextfield("tagline", profile.tagline, taglineMax)}
				</div>
				${this.renderClaimsList(user)}
				<ul class="detail">
					<li>user id: <span>${userId}</span></li>
					<li>joined: <span>${joinedDate}</span></li>
				</ul>
				${this.changedProfile ? html`
					<div class="buttonbar">
						<button @click=${this.handleSave}>
							Save
						</button>
					</div>
				` : null}
			</iron-loading>
		`
	}
}
