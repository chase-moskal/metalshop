
import mod from "module"
const require = mod.createRequire(import.meta.url)
export * from "google-auth-library"
import * as _googleAuth from "google-auth-library"
const googleAuth: typeof _googleAuth =
	require("google-auth-library") as typeof _googleAuth

export default googleAuth

const {
	OAuth2Client
} = googleAuth

export {
	OAuth2Client
}
