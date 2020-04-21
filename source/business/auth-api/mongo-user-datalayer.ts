
import {Collection, ObjectId, ObjectID} from "../../commonjs/mongodb.js"
import {UserRecord, Claims, UserDatalayer, UserDraft} from "../../interfaces.js"

interface UserRaw extends UserDraft {
	_id?: ObjectID
}

const toRecord = (raw?: UserRaw): UserRecord => (raw && {
	claims: raw.claims,
	googleId: raw.googleId,
	userId: raw._id.toHexString(),
})

const toMongoId = (userId: string) => new ObjectId(userId)

export function mongoUserDatalayer(collection: Collection): UserDatalayer {

	async function getRecordByUserId(
		userId: string
	): Promise<UserRecord> {
		return toRecord(
			await collection.findOne<UserRaw>({
				_id: toMongoId(userId)
			})
		)
	}

	async function getRecordByGoogleId(
		googleId: string
	): Promise<UserRecord> {
		return toRecord(
			await collection.findOne<UserRaw>({googleId})
		)
	}

	async function insertRecord(
		draft: UserDraft
	): Promise<UserRecord> {
		const {insertedId: _id} = await collection.insertOne(draft)
		return toRecord({...draft, _id})
	}

	async function setRecordClaims(
		userId: string,
		claims: Claims,
	): Promise<UserRecord> {
		const _id = toMongoId(userId)
		await collection.updateOne({_id}, {
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
