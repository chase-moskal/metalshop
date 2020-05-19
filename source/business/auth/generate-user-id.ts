
import {random8} from "../../toolbox/random8.js"

export function generateUserId(): string {
	return random8() + random8()
}
