
import {randomSequence, hex} from "./random8.js"

export function generateId(): string {
	return randomSequence(24, hex)
}
