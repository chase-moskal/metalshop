
import {MetalConfig} from "../types.js"
import {MetalshopStartupError} from "../system/errors.js"

const err = (message: string) => new MetalshopStartupError(message)

export function parseConfig(element: HTMLElement): MetalConfig {
	if (!element) throw err(`<metal-config> element is required`)

	//
	// collect config attributes
	//

	const config = <MetalConfig>{}
	for (const {name, value} of Array.from(element.attributes))
		config[name] = value

	//
	// validate required attributes
	//

	const requiredAttributes = [
		"auth-server",
		"liveshow-server",
		"paywall-server",
		"questions-server",
		"schedule-server",
		"settings-server",
	]

	for (const attribute of requiredAttributes) {
		if (!config[attribute])
			throw err(`<metal-config> requires attribute [${attribute}]`)
	}

	return config
}
