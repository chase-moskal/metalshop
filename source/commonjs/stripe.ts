
import mod from "module"
const require = mod.createRequire(import.meta.url)
import _thing from "stripe"
const thing: typeof _thing = require("stripe") as typeof _thing

export * from "stripe"
export default thing
