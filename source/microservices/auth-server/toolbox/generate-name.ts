
import {
	colors,
	animals,
	adjectives,
	uniqueNamesGenerator,
} from "../commonjs/unique-names-generator.js"

export function generateName() {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals]
	})
}
