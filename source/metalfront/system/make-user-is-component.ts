
import * as loading from "../toolbox/loading.js"
import {MetalshopComponent, html, property} from "../framework/metalshop-component.js"

import {MetalUser} from "../../types.js"
import {AccountShare, ConstructorFor} from "../types.js"

export function makeUserIsComponent(
		userEvaluator: (user: MetalUser) => boolean
	): ConstructorFor<MetalshopComponent<AccountShare>> {

	class MetalIs extends MetalshopComponent<AccountShare> {
		@property({type: Boolean, reflect: true}) active: boolean

		autorun() {
			const {authLoad} = this.share
			const authPayload = loading.payload(authLoad)
			this.active = !!authPayload && userEvaluator(authPayload.user)
		}

		renderHeader() {
			return null
		}

		render() {
			const {authLoad} = this.share
			return html`
				<iron-loading .load=${authLoad}>
					${this.active
						? html`
							${this.renderHeader()}
							<slot></slot>
						`
						: html`<slot name="not"></slot>`}
				</iron-loading>
			`
		}
	}

	return MetalIs
}
