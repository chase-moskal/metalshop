
import {mixinStyles} from "../framework/mixin-styles.js"
import {MetalshopComponent, html, property, css} from "../framework/metalshop-component.js"

const styles = css`

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

`

 @mixinStyles(styles)
export class IronReset extends MetalshopComponent<void> {

	private handleReset() {
		window.localStorage.clear()
		window.sessionStorage.clear()
		window.location.reload()
	}

	render() {
		return html`
			<div class=coolbuttonarea>
				<button @click=${this.handleReset}>
					<slot>
						Developer Reset
					</slot>
				</button>
			</div>
		`
	}
}
