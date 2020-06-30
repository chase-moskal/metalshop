
import {Collection} from "../../commonjs/mongodb.js"
import {ProfileDatalayer, Profile} from "../../interfaces.js"

export function mongoProfileDatalayer({collection}: {
		collection: Collection
	}): ProfileDatalayer {
	return {

		async upsertRecord(record) {
			const {userId} = record
			await collection.replaceOne({userId}, record, {upsert: true})
		},

		async getRecordByUserId(userId) {
			return collection.findOne<Profile>({userId})
		},
	}
}
