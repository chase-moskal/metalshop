
import * as jsonwebtoken from "jsonwebtoken"

export async function signToken<Payload = any>({payload, secretKey, expiresIn}: {
	payload: Payload
	secretKey: string | Buffer
	expiresIn: number | string
}): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jsonwebtoken.sign(
			<any>payload,
			secretKey,
			{algorithm: "HS256", expiresIn},
			(error, token) => {
				if (error) reject(error)
				else resolve(token)
			}
		)
	})
}

export async function verifyToken<Payload = any>({token, secretKey}: {
	token: string
	secretKey: string | Buffer
}): Promise<Payload> {
	return new Promise<Payload>((resolve, reject) => {
		jsonwebtoken.verify(token, secretKey, (error, payload) => {
			if (error) reject(error)
			else resolve(<Payload><unknown>payload)
		})
	})
}
