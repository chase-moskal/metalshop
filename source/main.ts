
import * as fsp from "./toolbox/fsp"
import * as authServer from "./auth-server"

async function main() {
	const port = 8080

	const server = await authServer.createAuthServer({
		port,
		secretKey: await fsp.readFile("hs256.key"),
		tokenExpiresIn: "24h",
		getAuthPayload: async() => ({
			user: {
				id: 1,
				username: "chase",
				email: "lordbrimshaw@gmail.com",
				roles: ["guest", "viewer", "vip", "admin"]
			}
		})
	})

	console.log(`Authoritarian running on port ${port}`)
}

main()
	.catch(error => console.error(error))
