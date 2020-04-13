
import {SimpleConsole} from "./logger.js"
import {Middleware} from "../commonjs/koa.js"

export const health = ({
	logger,
	path = "/health",
	result = "healthy",
}: {
	path?: string
	result?: string
	logger?: SimpleConsole
} = {}): Middleware => async(context, next) => {
	if (logger) logger.log("health check")
	return context.URL.pathname === path
		? context.body = result
		: next()
}
