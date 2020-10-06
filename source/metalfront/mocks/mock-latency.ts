
import {Topic} from "../../types.js"
import {nap} from "../toolbox/nap.js"
import {Method} from "renraku/dist/types.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"

const lag = <T extends (...args: any[]) => Promise<any>>(func: T, duration: number) => {
	return async function(...args: any[]) {
		const ms = duration + (Math.random() * duration)
		await nap(ms)
		return func.apply(this, args)
	}
}

export function mockLatency<T extends Topic>(duration: number, topic: T): T {
	const newTopic = {}
	for (const [key, value] of Object.entries<Method>(topic)) {
		newTopic[key] = lag(value, duration)
	}
	return <T>newTopic
}

export function mockLatencyDbby<T extends DbbyTable<{}>>(duration: number, table: T): T {
	const {...methods} = table
	const newMethods = {}
	for (const [key, value] of Object.entries(methods)) {
		newMethods[key] = lag(value, duration)
	}
	return <T>newMethods
}
