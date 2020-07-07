
// import {GoldStatsShare} from "../../interfaces.js"
// import * as loading from "../../toolbox/loading.js"
// import {mixinStyles} from "../../framework/mixin-styles.js"
// import {MetalshopComponent, html, css} from "../../framework/metalshop-component.js"

// import {wrapAdmin} from "./tools/wrap-admin.js"
// import {TextChangeEvent} from "../iron-text-input.js"

// @mixinStyles(css`
// 	* {
// 		margin: 0;
// 		padding: 0;
// 		box-sizing: border-box;
// 	}
// `)
// export class GoldStats extends MetalshopComponent<GoldStatsShare> {

// 	private async handleTextChange(event: TextChangeEvent) {
// 		const {text} = event.detail
// 		const {query} = this.share
// 		await query(text)
// 	}

// 	render() {
// 		const {resultsLoad} = this.share
// 		const results = loading.payload(resultsLoad) || []
// 		return wrapAdmin(html`
// 			<iron-text-input @textchange=${this.handleTextChange}>
// 				Search for Users
// 			</iron-text-input>
// 			<iron-loading .load=${resultsLoad}>
// 				${results.map(persona => html`
// 					<li>
// 						<cobalt-avatar .persona=${persona}></cobalt-avatar>
// 						<cobalt-card .persona=${persona}></cobalt-card>
// 					</li>
// 				`)}
// 			</iron-loading>
// 		`)
// 	}
// }

