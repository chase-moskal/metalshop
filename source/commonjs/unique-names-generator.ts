
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _generatorModule from "unique-names-generator"
const generatorModule =
	require("unique-names-generator") as typeof _generatorModule

const {
	colors,
	animals,
	adjectives,
	uniqueNamesGenerator,
} = generatorModule

export {
	colors,
	animals,
	adjectives,
	uniqueNamesGenerator,
}
