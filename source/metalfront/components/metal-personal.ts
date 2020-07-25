
import {PersonalShare} from "../types.js"
import {mixinStyles} from "../framework/mixin-styles.js"
import {styles} from "./styles/metal-personal-styles.js"
import {MetalshopComponent, html} from "../framework/metalshop-component.js"

 @mixinStyles(styles)
export class MetalPersonal extends MetalshopComponent<PersonalShare> {

	render() {
		const {personal, personalLoad, saveProfile} = this.share
		const user = personal?.user
		return html`
			<iron-loading
				.load=${personalLoad}
				class="container formarea coolbuttonarea">
					<cobalt-avatar .user=${user}></cobalt-avatar>
					<cobalt-card .user=${user} .saveProfile=${saveProfile}></cobalt-card>
			</iron-loading>
		`
	}
}
