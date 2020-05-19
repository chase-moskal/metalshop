
import {Collection,} from "../../commonjs/mongodb.js"
import {UserRecord, Claims, UserDatalayer} from "../../interfaces.js"

export function mongoUserDatalayer(collection: Collection): UserDatalayer {

	async function getRecordByUserId(userId: string): Promise<UserRecord> {
		return await collection.findOne<UserRecord>({userId})
	}

	async function getRecordByGoogleId(googleId: string): Promise<UserRecord> {
		return await collection.findOne<UserRecord>({googleId})
	}

	async function insertRecord(record: UserRecord): Promise<void> {
		await collection.insertOne(record)
	}

	async function setRecordClaims(
			userId: string,
			claims: Claims,
		): Promise<UserRecord> {
		await collection.updateOne({userId}, {
			$set: {claims: {$set: claims}}
		})
		return getRecordByUserId(userId)
	}

	return {
		insertRecord,
		setRecordClaims,
		getRecordByUserId,
		getRecordByGoogleId,
	}
}
