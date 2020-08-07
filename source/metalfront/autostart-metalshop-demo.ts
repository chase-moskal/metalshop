
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
		mockQuestionData: {
			taglines: [
				"Victoria BC, Canada",
				"Deep Sea Diver",
				"podcaster extraordinaire",
				"Literally a wizard!! 🔬",
				"THE REAL DEAL",
				"professional badass",
			],
			contents: [
				"how many hexadecimal digits are reasonable to avoid birthday-problem collisions when generating id's in the system?",
				"What's the number of starts in the milky way galaxy?",
				"why is the sky blue? is there a planet with a green sky?",
				"The Pyramids. WERE THEY CREATED BY ALIENS",
				"I THINK STEVEN SEAGAL IS GAY??",
				"i don't even care 👉😎👉",
			],
		},
	})

	registerComponents({
		...components,
		...demoComponents,
	})

	await start()
}()
