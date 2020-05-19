
import {UserDatalayer, UserRecord, Claims} from "../../../interfaces.js"

export function mockUserDatalayer(): UserDatalayer {

	//
	// private
	//

	const records: UserRecord[] = []

	//
	// public
	//

	async function getRecordByUserId(
			userId: string
		): Promise<UserRecord> {
		return records.find(record => record.userId === userId)
	}

	async function getRecordByGoogleId(
			googleId: string
		): Promise<UserRecord> {
		return records.find(record => record.googleId === googleId)
	}

	async function insertRecord(
			record: UserRecord
		): Promise<void> {
		records.push(record)
	}

	async function setRecordClaims(
			userId: string,
			claims: Claims,
		): Promise<UserRecord> {
		const record = await getRecordByUserId(userId)
		record.claims = claims
		return record
	}

	return {
		insertRecord,
		setRecordClaims,
		getRecordByUserId,
		getRecordByGoogleId,
	}
}
