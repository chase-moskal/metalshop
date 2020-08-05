
import {Topic} from "../../types.js"
import {nap} from "../toolbox/nap.js"
import {Method} from "renraku/dist/interfaces.js"

const lag = <T extends (...args: any[]) => Promise<any>>(func: T, duration: number) => {
	return async function(...args: any[]) {
		const ms = duration + (Math.random() * duration)
		await nap(ms)
		return func.apply(this, args)
	}
}

export function mockLatency<T extends Topic>(topic: T, duration: number) {
	for (const [key, value] of Object.entries<Method>(topic)) {
		topic[key] = lag(value, duration)
	}
}
