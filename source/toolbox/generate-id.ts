
import {randomSequence, numbers} from "./random8.js"

export function generateId(): string {
	return randomSequence(40, numbers)
}
