
import {AppListShare} from "../../types.js"
import * as loading from "../../toolbox/loading.js"
import {mixinStyles} from "../../framework/mixin-styles.js"
import {MetalshopComponent, html, property, css} from "../../framework/metalshop-component.js"

const styles = css``

 @mixinStyles(styles)
export class MetalPaywall extends MetalshopComponent<AppListShare> {

	 @property({type: Object})
	paywallLoad: loading.Load<void> = loading.ready<void>()

	render() {
		// const meta = loading.meta(personalLoad, premiumInfoLoad, paywallLoad)
		const meta = loading.ready(true)
		return html`
			<iron-loading .load=${meta} class="coolbuttonarea">
				app-list
			</iron-loading>
		`
	}
}
