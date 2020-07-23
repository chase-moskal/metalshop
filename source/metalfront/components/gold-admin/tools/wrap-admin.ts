
import {html, TemplateResult} from "../../../framework/metalshop-component.js"

export const wrapAdmin = (content: TemplateResult) => html`
	<metal-is-loggedin>
		<p slot="not">not logged in</p>
		<metal-is-staff>
			${content}
			<p slot="not">not admin</p>
		</metal-is-staff>
	</metal-is-loggedin>
`
