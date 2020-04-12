
import chalk from "../commonjs/chalk.js"
import {Chalk} from "../commonjs/chalk.js"

export interface SimpleConsole {
	log(...args: any[]): void
	info(...args: any[]): void
	debug(...args: any[]): void
	warn(...args: any[]): void
	error(...args: any[]): void
	clear(): void
}

export class Logger implements SimpleConsole {
	private _chalk: Chalk
	private _console: SimpleConsole
	private get _timestamp() {
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
		return `[${calendar}:${clock}]`
	}

	constructor({_console = console, force = true}: {
		force?: boolean
		_console?: Console
	} = {}) {
		this._console = _console
		this._chalk = new chalk.Instance(force ? {level: 1}: undefined)
	}

	log(...args: any[]): void {
		const {_console, _chalk, _timestamp} = this
		_console.log(_chalk.grey(_timestamp), ...args)
	}

	info(...args: any[]): void {
		const {_console, _chalk, _timestamp} = this
		_console.info(_chalk.cyanBright(_timestamp), ...args)
	}

	debug(...args: any[]): void {
		const {_console, _chalk, _timestamp} = this
		_console.debug(_chalk.cyan(_timestamp), ...args)
	}

	warn(...args: any[]): void {
		const {_console, _chalk, _timestamp} = this
		_console.warn(_chalk.yellow(_timestamp), ...args)
	}

	error(...args: any[]): void {
		const {_console, _chalk, _timestamp} = this
		_console.error(_chalk.red(_timestamp), ...args)
	}

	clear(): void {
		this._console.clear()
	}
}
