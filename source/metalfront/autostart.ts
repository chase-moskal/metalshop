
import "menutown/dist/register-all.js"

import {install} from "./install.js"
import {registerComponents} from "./toolbox/register-components.js"

~async function() {
	const metalshop = await install()
	registerComponents(metalshop.components)
	await metalshop.start()
}()
