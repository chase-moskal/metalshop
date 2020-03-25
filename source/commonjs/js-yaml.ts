
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _jsYaml from "js-yaml"
const jsYaml: typeof _jsYaml = require("js-yaml") as typeof _jsYaml

export default jsYaml
