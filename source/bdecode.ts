
import {TokenData} from "./interfaces.js"

export function bdecode<Payload = any>(token: string): TokenData<Payload> {
	const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
	const data = decodeURIComponent(atob(b64).split("").map(c =>
		"%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
	).join(""))
	return JSON.parse(data)
}
