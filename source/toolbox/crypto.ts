
import * as jsonwebtoken from "jsonwebtoken"

export type Payload = any

export async function signToken({payload, secretKey, expiresIn}: {
	payload: any
	secretKey: string | Buffer
	expiresIn: number | string
}): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jsonwebtoken.sign(
			payload,
			secretKey,
			{algorithm: "HS256", expiresIn},
			(error, token) => {
				if (error) reject(error)
				else resolve(token)
			}
		)
	})
}

export async function verifyToken({token, secretKey}: {
	token: string
	secretKey: string | Buffer
}): Promise<any> {
	return new Promise((resolve, reject) => {
		jsonwebtoken.verify(token, secretKey, (error, payload) => {
			if (error) reject(error)
			else resolve(payload)
		})
	})
}
