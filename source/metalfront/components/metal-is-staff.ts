
import {mixinStyles} from "../framework/mixin-styles.js"
import {property, html, css} from "../framework/metalshop-component.js"

import {isStaff} from "../../business/core/user-evaluators.js"
import {makeUserIsComponent} from "../system/make-user-is-component.js"

const styles = css`

:host([active][fancy]) {
	display: block;
	padding: 1em 0.5em !important;
	border: 1px solid;
	border-radius: 3px;
	color: var(--metal-admin-color, #ff5c98);
	--coolbutton-background: var(--metal-admin-color, #ff5c98);
}

.header {
	opacity: 0.5;
	font-size: 1.2em;
	margin-bottom: 0.5em;
	font-weight: bold;
	text-transform: uppercase;
}

`

 @mixinStyles(styles)
export class MetalIsStaff extends makeUserIsComponent(isStaff) {

	 @property({type: Boolean, reflect: true})
	fancy: boolean

	renderHeader() {
		return this.fancy
			? html`<p class="header">Admin-only controls</p>`
			: null
	}
}

//  @mixinStyles(styles)
// export class MetalIsStaff extends MetalshopComponent<AdminOnlyShare> {

// 	 @property({type: Boolean, reflect: true})
// 	["fancy"]: boolean

// 	 @property({type: Boolean, reflect: true})
// 	["admin"]: boolean = false

// 	 @property({type: Boolean, reflect: true})
// 	["not-admin"]: boolean = true

// 	async autorun() {
// 		const {personalLoad} = this.share
// 		const personal = loading.payload(personalLoad)
// 		const admin = (
// 			(personal
// 				&& personal.user.claims.admin
// 				&& personal.settings.actAsAdmin)
// 					? true
// 					: false
// 		)
// 		this["admin"] = admin
// 		this["not-admin"] = !admin
// 		this.requestUpdate()
// 	}

// 	render() {
// 		const {personalLoad} = this.share
// 		const header = this["fancy"]
// 			? html`<p class="header"><strong>Admin-only controls</strong></p>`
// 			: null
// 		return html`
// 			<iron-loading .load=${personalLoad}>
// 				${this["admin"]
// 					? html`
// 						${header}
// 						<slot></slot>
// 					`
// 					: html`
// 						<slot name="not"></slot>
// 					`}
// 			</iron-loading>
// 		`
// 	}
// }
