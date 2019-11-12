
const browser: boolean = typeof atob === "function"

export function textToBase64(text: string) {
	return browser
		? btoa(text)
		: new Buffer(text).toString("base64")
}

export function base64ToText(base64: string) {
	return browser
		? atob(base64)
		: new Buffer(base64, "base64").toString("binary")
}
