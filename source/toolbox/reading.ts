
import {promises} from "fs"
import yaml from "../commonjs/js-yaml.js"

export const read = (path: string): Promise<string> =>
	promises.readFile(path, "utf8")

export const readYaml = async(path: string) => yaml.safeLoad(
	await promises.readFile(path, "utf8")
)
