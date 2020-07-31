
import {star} from "../system/icons.js"
import {MetalUser} from "../../types.js"
import {silhouette} from "../system/icons.js"
import {mixinStyles} from "../framework/mixin-styles.js"
import {MetalshopComponent, html, property, css, TemplateResult} from "../framework/metalshop-component.js"

import * as evaluators from "../../business/core/user-evaluators.js"

const styles = css`

:host {
	--internal-badge-size: calc(var(--cobalt-avatar-size, 6em) / 4);
}

.container {
	position: relative;
}

.avatar {
	width: var(--cobalt-avatar-size, 6em);
	height: var(--cobalt-avatar-size, 6em);
}

:host([rounded]) .avatar {
	overflow: hidden;
	border-radius: var(--cobalt-avatar-size, 6em);
}

img, svg {
	display: block;
	width: 100%;
	height: 100%;
}

.badges {
	position: absolute;
	top: -10%;
	left: -10%;
	display: flex;
	flex-wrap: wrap;
	width: 120%;
}

.badges > span {
	position: relative;
	width: var(--internal-badge-size);
	height: var(--internal-badge-size);
	border-radius: var(--internal-badge-size);
	color: yellow;
	background: #7a7a008a;
}

.badges svg {
	position: absolute;
	width: 100%;
	height: 100%;
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
		const avatar = user?.profile.avatar
		return html`
			<div class=container>
				<div class=avatar>
					${avatar
						? html`<img src=${avatar} alt="[avatar]"/>`
						: fallbackAvatar}
				</div>
				${this.renderBadges(user)}
			</div>
		`
	}

	private renderBadges(user?: MetalUser) {
		if (!user) return null

		const premiumBadge = evaluators.isPremium(user) ? html`
			<span title="premium member">${star}</span>
		` : null

		return html`
			<div class=badges>
				${premiumBadge}
			</div>
		`
	}
}
