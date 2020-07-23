
import {MetalUser} from "../../types.js"
import {silhouette} from "../system/icons.js"
import {mixinStyles} from "../framework/mixin-styles.js"
import {MetalshopComponent, html, property, css, TemplateResult} from "../framework/metalshop-component.js"

const styles = css`

img, svg {
	display: block;
	width: var(--cobalt-avatar-size, 6em);
	height: var(--cobalt-avatar-size, 6em);
}

`

 @mixinStyles(styles)
export class CobaltAvatar extends MetalshopComponent<void> {

	 @property({type: Object})
	fallbackAvatar: TemplateResult = silhouette

	 @property({type: Object})
	user?: MetalUser

	render() {
		const {user, fallbackAvatar} = this
		const avatar = user?.profile?.avatar
		return html`
			${avatar
				? html`<img src=${avatar} alt="[avatar]"/>`
				: fallbackAvatar}
		`
	}
}
