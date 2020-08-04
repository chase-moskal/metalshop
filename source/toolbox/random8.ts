
export function randomSample<T>(random: number, palette: T[]): T {
	return palette[Math.floor(random * palette.length)]
}

export function randomSequence(length: number, palette: string[]): string {
	const results: string[] = []
	while (results.length < length) {
		const random = Math.random()
		const sample = randomSample(random, palette)
		results.push(sample)
	}
	return results.join("")
}

export const numbers = [..."0123456789"]
export const alphahex = [..."abcdef"]
export const alphabet = [...alphahex, ..."ghijklmnopqrstuvwxyz"]
export const alphabetupper = alphabet.map(c => c.toUpperCase())
export const hex = [...numbers, ...alphahex]
export const alphanumeric = [...numbers, ...alphabet]
export const casedalphanumeric = [...numbers, ...alphabet, ...alphabetupper]

export const random8 = () => randomSequence(8, hex)
