
import {ProfileDatalayer, ProfileRecord} from "../../interfaces.js"

export function mockProfileDatalayer(): ProfileDatalayer {
	const records: ProfileRecord[] = []

	async function getRecordByUserId(userId: string): Promise<ProfileRecord> {
		return records.find(record => record.userId === userId)
	}

	async function upsertRecord(record: ProfileRecord): Promise<void> {
		records.push(record)
	}

	return {
		upsertRecord,
		getRecordByUserId,
	}
}
