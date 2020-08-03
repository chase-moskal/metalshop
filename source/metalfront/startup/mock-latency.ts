
import {Topic} from "../../types.js"
import {nap} from "../toolbox/nap.js"
import {Method} from "renraku/dist/interfaces.js"

const lag = <T extends (...args: any[]) => Promise<any>>(func: T) => {
	return async function(...args: any[]) {
		const ms = (Math.random() * 300) + 100
		console.log(`mock lag added: ${func.name} by ${ms.toFixed(0)} milliseconds`)
		await nap(ms)
		return func.apply(this, args)
	}
}

export function mockLatency<T extends Topic>(topic: T) {
	for (const [key, value] of Object.entries<Method>(topic)) {
		topic[key] = lag(value)
	}
}
