
function randomSample<T>(palette: T[], random: number): T {
	return palette[Math.floor(random * palette.length)]
}

export function randomSequence(length: number, palette: string[]): string {
	const results: string[] = []
	while (results.length < length) {
		const random = Math.random()
		const sample = randomSample(palette, random)
		results.push(sample)
	}
	return results.join("")
}

export const numbers = [..."0123456789"]
export const alphabet = [..."abcdefghijklmnopqrstuvwxyz"]
export const alphanumeric = [...numbers, ...alphabet]

export const random8 = () => randomSequence(8, alphanumeric)
