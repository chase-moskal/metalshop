
import * as fs from "fs"

export async function readFileBuffer(path: string): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		fs.readFile(path, (error, data) => {
			if (error) reject(error)
			else resolve(data)
		})
	})
}

export async function readFile(path: string, encoding = "utf8"): Promise<string> {
	const buffer = await readFileBuffer(path)
	return buffer.toString(encoding)
}

export async function readJson<T extends Object = Object>(path: string): Promise<T> {
	return JSON.parse(await readFile(path))
}
