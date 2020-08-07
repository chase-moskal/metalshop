
import {MockQuestion} from "../types.js"

export const mockQuestions: MockQuestion[] = [
	{
		tagline: "Victoria BC, Canada",
		content: "how many hexadecimal digits are reasonable to avoid birthday-problem collisions when generating id's in the system?",
		likes: 5,
		ban: undefined,
	},
	{
		tagline: "Deep Sea Diver",
		content: "What's the number of starts in the milky way galaxy?",
		likes: 4,
		ban: undefined,
	},
	{
		tagline: "podcaster extraordinaire",
		content: "why is the sky blue? is there a planet with a green sky?",
		likes: 4,
		ban: undefined,
	},
	{
		tagline: "Literally a wizard!! 🔬",
		content: "The Pyramids. WERE THEY CREATED BY ALIENS",
		likes: 2,
		ban: undefined,
	},
	{
		tagline: "THE REAL DEAL",
		content: "I THINK STEVEN SEAGAL IS GAY??",
		likes: 1,
		ban: {
			days: 14,
			reason: "rude postings",
		},
	},
	{
		tagline: "professional badass",
		content: "i don't even care 👉😎👉",
		likes: 0,
		ban: undefined,
	},
]
