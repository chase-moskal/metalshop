
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _thing from "koa-bodyparser"
const thing: typeof _thing = require("koa-bodyparser") as typeof _thing

export default thing
