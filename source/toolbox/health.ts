
import {SimpleConsole} from "./logger.js"
import {httpHandler} from "./http-handler.js"
import {Middleware} from "../commonjs/koa.js"

export const health = ({
	logger,
	path = "/health",
	result = "healthy",
}: {
	path?: string
	result?: string
	logger?: SimpleConsole
} = {}): Middleware => httpHandler("get", path, async() => {
	if (logger) logger.log("health check")
	return result
})
