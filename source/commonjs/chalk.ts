
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _chalk from "chalk"
const chalk: typeof _chalk = require("chalk") as typeof _chalk

type Chalk = _chalk.Chalk & _chalk.ChalkFunction

export default chalk
export {Chalk}
