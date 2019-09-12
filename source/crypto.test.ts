
import {readFileSync} from "fs"
import {signToken, verifyToken} from "./crypto"

const nap = (duration: number) => new Promise(
	resolve => setTimeout(resolve, duration)
)

function tamperStringHalfway(subject: string) {
	const {length} = subject
	return Array.from(subject).map(
		(character, index) => index === Math.floor(length / 2)
			? "@"
			: character
	).join("")
}

describe("crypto", () => {
	const payload = {a: true, b: 2}
	const publicKey: string = readFileSync("public.pem", "utf-8")
	const privateKey: string = readFileSync("private.pem", "utf-8")

	it("signed token passes verification", async() => {
		const token = await signToken({
			payload,
			privateKey,
			expiresIn: "100s",
		})
		const payload2 = await verifyToken({
			token,
			publicKey,
		})
		await expect(payload2.a).toEqual(payload.a)
		await expect(payload2.b).toEqual(payload.b)
	})

	it("expired token fails verification", async() => {
		const token = await signToken({
			payload,
			privateKey,
			expiresIn: "1s",
		})
		await nap(1.1 * 1000)
		const failingVerification = () => verifyToken({
			token,
			publicKey,
		})
		await expect(failingVerification()).rejects.toBeTruthy()
	})

	it("tampered token fails verification", async() => {
		let goodToken = await signToken({
			payload,
			privateKey,
			expiresIn: "100s",
		})
		const badToken = tamperStringHalfway(goodToken)
		const failingVerification = () => verifyToken({
			token: badToken,
			publicKey,
		})
		await expect(failingVerification()).rejects.toBeTruthy()
	})
})
