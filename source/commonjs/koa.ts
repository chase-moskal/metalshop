
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _Koa from "koa"
const Koa: typeof _Koa = require("koa") as typeof _Koa

export default Koa
type Middleware = _Koa.Middleware

export {Middleware}
