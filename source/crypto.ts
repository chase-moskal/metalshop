
import {TokenData} from "./interfaces.js"
import * as jsonwebtoken from "jsonwebtoken"

export async function signToken<Payload = any>({payload, privateKey, expiresIn}: {
	payload: Payload
	privateKey: string
	expiresIn: number | string
}): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jsonwebtoken.sign(
			<TokenData<Payload>>{payload},
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
}): Promise<TokenData<Payload>> {
	return new Promise<TokenData<Payload>>((resolve, reject) => {
		jsonwebtoken.verify(token, publicKey, (error, data: TokenData<Payload>) => {
			if (error) reject(error)
			else resolve(data)
		})
	})
}

export function decodeToken<Payload = any>({token}: {
	token: string
}): TokenData<Payload> {
	return <TokenData<Payload>>jsonwebtoken.decode(token)
}
