
import {MetalshopComponent, html, mixinStyles} from "../../metalfront/framework/metalshop-component.js"

import {AdminShare} from "./admin-types.js"
import styles from "./admin.css.js"

 @mixinStyles(styles)
export class MetalPermissions extends MetalshopComponent<AdminShare> {
	render() {
		return html`metal-permissions, yo!`
	}
}
