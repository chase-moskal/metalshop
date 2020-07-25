
import {isStaff} from "../../business/core/user-evaluators.js"

import {mixinStyles} from "../framework/mixin-styles.js"
import {property, html, css, LitElement} from "../framework/metalshop-component.js"
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

const SuperComponent: typeof LitElement = <any>makeUserIsComponent(isStaff)

 @mixinStyles(styles)
export class MetalIsStaff extends SuperComponent {

	 @property({type: Boolean, reflect: true})
	fancy: boolean


	renderHeader() {
		return this.fancy
			? html`<p class="header">Admin-only controls</p>`
			: null
	}
}
