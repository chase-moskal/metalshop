
import {ProfileDatalayer, Profile} from "../../../interfaces.js"

export function mockProfileDatalayer(): ProfileDatalayer {
	const records: Profile[] = []

	async function getRecordByUserId(userId: string): Promise<Profile> {
		return records.find(record => record.userId === userId)
	}

	async function upsertRecord(record: Profile): Promise<void> {
		const existing = await getRecordByUserId(record.userId)
		if (existing && existing !== record)
			Object.assign(existing, record)
		else
			records.push(record)
	}

	return {
		upsertRecord,
		getRecordByUserId,
	}
}
