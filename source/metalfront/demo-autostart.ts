
import "menutown/dist/register-all.js"

import {installDemo} from "./demo-install.js"
import {mockAvatars} from "./mocks/mock-avatars.js"
import {mockQuestions} from "./mocks/mock-questions.js"
import {registerComponents} from "./toolbox/register-components.js"
import {demoComponents} from "./components/demos/all-demo-components.js"
import {adjectives, animals, colors} from "../toolbox/nickname-dictionaries.js"

~async function() {
	const {components, start} = await installDemo({
		mockAvatars,
		mockQuestions,
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
