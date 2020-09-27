
import {isNode} from "./is-node.js"
import {encodeHex} from "./bytes.js"

export const getRandomBytes: (bytes: number) => ArrayBuffer = await (async() =>
	isNode

		? await (async() => {
			const {randomBytes} = await import("crypto")
			return (bytes: number) => randomBytes(bytes).buffer
		})()

		: (bytes: number) => crypto.getRandomValues(new Uint8Array(bytes)).buffer
)()

export function random(): number {
	const buffer = getRandomBytes(8)
	const ints = new Int8Array(buffer)
	ints[7] = 63
	ints[6] |= 0xf0
	const view = new DataView(buffer)
	return view.getFloat64(0, true) - 1
}

export function randomId() {
	const bytes = getRandomBytes(24)
	return encodeHex(bytes)
}

export function randomSample<T>(palette: T[]): T {
	return palette[Math.floor(random() * palette.length)]
}