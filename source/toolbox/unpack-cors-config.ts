
import {JsonRegex, CorsConfig} from "../interfaces.js"

export const unpackCorsConfig = ({allowed, forbidden}: CorsConfig) => ({
	allowed: unpackRegex(allowed),
	forbidden: unpackRegex(forbidden),
})

export const unpackRegex = (json: JsonRegex) => json
	? new RegExp(json.pattern, json.flags)
	: null
