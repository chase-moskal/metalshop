
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _cors from "@koa/cors"
const cors: typeof _cors = require("@koa/cors") as typeof _cors

export default cors
