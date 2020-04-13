
import chalk from "../commonjs/chalk.js"
import {Chalk} from "../commonjs/chalk.js"

export interface SimpleConsole {
	log: typeof console.log
	info: typeof console.info
	debug: typeof console.debug
	warn: typeof console.warn
	error: typeof console.error
	clear: typeof console.clear
}

export class Logger implements SimpleConsole {
	log: typeof console.log
	info: typeof console.info
	debug: typeof console.debug
	warn: typeof console.warn
	error: typeof console.error
	clear: typeof console.clear

	constructor({con = console, colors = true}: {
		con?: Console
		colors?: boolean
	} = {}) {
		let chalkstick: Chalk
		if (colors === true)
			chalkstick = new chalk.Instance({level: 1})
		else if (colors === false)
			chalkstick = new chalk.Instance({level: 0})
		else
			chalkstick = new chalk.Instance()

		const timestamp = () => {
			const date = new Date()
			const year = date.getUTCFullYear()
			const month = (date.getUTCDate() + 1).toString().padStart(2, "0")
			const day = date.getUTCDate().toString().padStart(2, "0")
			const hours = date.getUTCHours().toString().padStart(2, "0")
			const minutes = date.getUTCMinutes().toString().padStart(2, "0")
			const seconds = date.getUTCSeconds().toString().padStart(2, "0")
			const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0")
			const calendar = `${year}-${month}-${day}`
			const clock = `${hours}:${minutes}:${seconds}.${milliseconds}`
			return `[${calendar} ${clock}]`
		}

		const prepare = (
			logfunc: (...args: any[]) => void,
			colorfunc: (s: string) => string
		) => (...args: any[]) => logfunc.call(
			con,
			colorfunc.call(chalkstick, timestamp()),
			...args
		)

		this.log = prepare(con.log, chalkstick.cyan)
		this.info = prepare(con.info, chalkstick.cyanBright)
		this.debug = prepare(con.debug, chalkstick.blueBright)
		this.warn = prepare(con.warn, chalkstick.yellow)
		this.error = prepare(con.error, chalkstick.redBright)
		this.clear = () => con.clear()
	}
}
