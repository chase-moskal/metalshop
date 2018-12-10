
import * as fsp from "./toolbox/fsp"
import * as authServer from "./auth-server"

import {OAuth2Client} from "google-auth-library"

async function main() {
	const port = 8080
	const secrets = fsp.readFile("secrets.json")
	const googleClientId = secrets["google"]["clientId"]

	const client = new OAuth2Client(googleClientId)

	async function verifyGoogle({token}): Promise<string> {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: googleClientId
		})
		const payload = ticket.getPayload()
		const userid = payload['sub']
		return userid
	}

	const server = await authServer.createAuthServer({
		port,
		secretKey: await fsp.readFile("hs256.key"),
		tokenExpiresIn: "24h",
		getAuthPayload: async() => {
			return {
				user: {
					id: 1,
					username: "chase",
					email: "lordbrimshaw@gmail.com",
					roles: ["guest", "viewer", "vip", "admin"]
				}
			}
		}
	})

	console.log(`Authoritarian running on port ${port}`)
}

main()
	.catch(error => console.error(error))
