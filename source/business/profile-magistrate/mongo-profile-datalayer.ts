
import {Collection} from "../../commonjs/mongodb.js"
import {ProfileDatalayer, ProfileRecord} from "../../interfaces.js"

export function mongoProfileDatalayer({collection}: {
	collection: Collection
}): ProfileDatalayer {

	async function getRecordByUserId(userId: string): Promise<ProfileRecord> {
		return collection.findOne<ProfileRecord>({userId})
	}

	async function upsertRecord(record: ProfileRecord): Promise<void> {
		const {userId} = record
		await collection.replaceOne({userId}, record, {upsert: true})
	}

	return {
		upsertRecord,
		getRecordByUserId,
	}
}
