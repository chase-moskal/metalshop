
import {SimpleConsole} from "./logger.js"

/**
 * Kill a node program on unhandled errors
 */
export function dieWithDignity({logger = console}: {
	logger?: SimpleConsole
} = {}) {

	process.on("unhandledRejection", (reason, error) => {
		logger.error("unhandled rejection:", reason, error)
		process.exit(1)
	})

	process.on("uncaughtException", error => {
		logger.error("unhandled exception:", error)
		process.exit(1)
	})
}
