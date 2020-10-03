
import {isNode} from "./is-node.js"
import {encodeHex} from "./bytes.js"

export const getRandomBytes: (bytes: number) => ArrayBuffer = (() =>
	isNode
		? (bytes: number) => require("crypto").randomBytes(bytes).buffer
		: (bytes: number) => crypto.getRandomValues(new Uint8Array(bytes)).buffer
)()

export const compare: (a: string, b: string) => boolean = (() =>
	isNode
		? (a: string, b: string) => require("crypto").timingSafeEqual(
			Buffer.from(a, "utf8"),
			Buffer.from(b, "utf8"),
		)
		: (a: string, b: string) => {
			// TODO implement secure browser compare
			console.warn("insecure compare")
			return a === b
		}
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

export function randomSequence(length: number, palette: string[]): string {
	const results: string[] = []
	while (results.length < length) {
		const sample = randomSample(palette)
		results.push(sample)
	}
	return results.join("")
}
