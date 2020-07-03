
import {random8} from "./random8.js"

export function generateId(): string {
	return random8() + random8()
}
