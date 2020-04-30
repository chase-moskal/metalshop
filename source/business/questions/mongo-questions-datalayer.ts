
import {Collection} from "../../commonjs/mongodb.js"
import {QuestionsDatalayer, QuestionRecord} from "../../interfaces.js"

export function mongoQuestionsDatalayer({collection}: {
	collection: Collection
}): QuestionsDatalayer {

	async function getRecordById(questionId: string): Promise<QuestionRecord> {
		return collection.findOne<QuestionRecord>({questionId})
	}

	async function saveRecord(record: QuestionRecord): Promise<void> {
		const {questionId} = record
		await collection.replaceOne({questionId}, record, {upsert: true})
	}

	async function likeRecord({like, userId, questionId}: {
		like: boolean
		userId: string
		questionId: string
	}): Promise<QuestionRecord> {
		const record = await getRecordById(questionId)
		const alreadyLike = record.likes.find(
			likeEntry => likeEntry.userId === userId
		)

		// add the like
		if (like && !alreadyLike) record.likes.push({userId})

		// remove the like
		if (!like && alreadyLike) record.likes = record.likes.filter(
			likeEntry => likeEntry.userId !== userId
		)

		await saveRecord(record)
		return record
	}

	async function archiveRecord(questionId: string): Promise<void> {
		await collection.updateOne({questionId}, {$set: {archive: true}})
	}

	async function fetchRecords(board: string): Promise<QuestionRecord[]> {
		return collection.find<QuestionRecord>({board, archive: false}).toArray()
	}

	async function purgeRecords(board: string): Promise<void> {
		await collection.updateMany({board, archive: false}, {$set: {
			archive: true
		}})
	}

	return {
		saveRecord,
		likeRecord,
		fetchRecords,
		purgeRecords,
		archiveRecord,
		getRecordById,
	}
}
