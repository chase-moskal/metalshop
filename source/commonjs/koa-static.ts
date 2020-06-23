
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _serve from "koa-static"
const serve: typeof _serve = require("koa-static") as typeof _serve

export default serve
