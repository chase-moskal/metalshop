
import {UserDraft, UsersData, UserRecord, Claims} from "../../interfaces.js"
import {generateId} from "../../toolbox/generate-id.js"

export function mockUsersData(): UsersData {

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
		draft: UserDraft
	): Promise<UserRecord> {
		const record: UserRecord = {
			...draft,
			userId: generateId(),
		}
		records.push(record)
		return record
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
