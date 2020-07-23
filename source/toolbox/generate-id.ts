
import {randomSequence, casedalphanumeric} from "./random8.js"

export function generateId(): string {
	return randomSequence(12, casedalphanumeric)
}
