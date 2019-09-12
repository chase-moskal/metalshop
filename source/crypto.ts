
import * as jsonwebtoken from "jsonwebtoken"

export async function signToken<Payload = any>({payload, privateKey, expiresIn}: {
	payload: Payload
	privateKey: string
	expiresIn: number | string
}): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jsonwebtoken.sign(
			<any>payload,
			privateKey,
			{algorithm: "RS256", expiresIn},
			(error, token) => {
				if (error) reject(error)
				else resolve(token)
			}
		)
	})
}

export async function verifyToken<Payload = any>({token, publicKey}: {
	token: string
	publicKey: string
}): Promise<Payload> {
	return new Promise<Payload>((resolve, reject) => {
		jsonwebtoken.verify(token, publicKey, (error, payload) => {
			if (error) reject(error)
			else resolve(<Payload><unknown>payload)
		})
	})
}

export function decodeToken<Payload = any>({token}: {token: string}): Payload {
	return <any>jsonwebtoken.decode(token)
}
