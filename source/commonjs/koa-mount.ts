
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _mount from "koa-mount"
const mount: typeof _mount = require("koa-mount") as typeof _mount

export default mount
