
import {css} from "../../framework/metalshop-component.js"
export const styles = css`

:host {
	display: block;
}

:host([hidden]) {
	display: none;
}

.container {
	display: flex;
	flex-direction: row;
}

cobalt-card {
	flex: 0 1 auto;
	padding-left: 1em;
}

`
