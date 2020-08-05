
import "menutown/dist/register-all.js"

import {mockAvatars} from "./mocks/mock-avatars.js"
import {installMetalshopDemo} from "./install-metalshop-demo.js"
import {registerComponents} from "./toolbox/register-components.js"
import {demoComponents} from "./components/demos/all-demo-components.js"
import {adjectives, animals, colors} from "../toolbox/nickname-dictionaries.js"

~async function startMetalshopDemo() {

	const {components, start} = await installMetalshopDemo({
		mockAvatars,
		nicknameData: [
			[...adjectives, ...colors],
			[...animals],
		],
	})

	registerComponents({
		...components,
		...demoComponents,
	})

	await start()
}()
