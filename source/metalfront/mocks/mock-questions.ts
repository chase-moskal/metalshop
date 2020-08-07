
import {MockQuestion} from "../types.js"

export const mockQuestions: MockQuestion[] = [
	{
		tagline: "Victoria BC, Canada",
		content: "How many hexadecimal digits are reasonably necessary to avoid birthday-problem collisions when generating id's?",
		likes: 5,
		ban: undefined,
	},
	{
		tagline: "Deep Sea Diver",
		content: "What's the number of stars in the milky way galaxy?",
		likes: 4,
		ban: undefined,
	},
	{
		tagline: "podcaster extraordinaire",
		content: "Why is the sky blue? is there a planet with a green sky?",
		likes: 4,
		ban: undefined,
	},
	{
		tagline: "Literally a wizard!! 🔬",
		content: "The Pyramids. WERE THEY CREATED BY ALIENS!?",
		likes: 2,
		ban: undefined,
	},
	{
		tagline: "THE REAL DEAL",
		content: "THIS FORUM SUCKS ASS",
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
