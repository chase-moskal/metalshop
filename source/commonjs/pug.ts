
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _pug from "pug"
export * from "pug"
const pug = require("pug") as typeof _pug

const {
	compile
} = pug

export {
	compile
}
