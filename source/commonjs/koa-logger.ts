
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _logger from "koa-logger"
const logger: typeof _logger = require("koa-logger") as typeof _logger

export default logger
