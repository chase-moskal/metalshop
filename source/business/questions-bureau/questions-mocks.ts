
import {tokenDecode} from "redcrypto/dist/token-decode.js"

import {
	TokenData,
	AccessToken,
	AccessPayload,
	QuestionRecord,
	QuestionsActions,
} from "../../interfaces.js"

export async function mockTokenVerify(
	token: AccessToken
): Promise<TokenData<AccessPayload>> {
	return tokenDecode(token)
}

export function createMockQuestionsActions(): QuestionsActions {
	const data: {
		records: QuestionRecord[]
	} = {records: []}

	async function getRecordById(questionId: string): Promise<QuestionRecord> {
		return data.records.find(record => (
			record.questionId === questionId
		))
	}

	async function fetchRecords(boardName: string): Promise<QuestionRecord[]> {
		return [...data.records.filter(record => (
			!record.archive &&
			record.board === boardName
		))]
	}

	async function saveRecord(
		record: QuestionRecord
	): Promise<void> {
		const already = await getRecordById(record.questionId)
		if (already) throw new Error(`cannot overwrite existing question`)
		else data.records.push(record)
	}

	async function likeRecord({like, userId, questionId}: {
		like: boolean
		userId: string
		questionId: string
	}): Promise<QuestionRecord> {
		const record = await getRecordById(questionId)
		if (like) {
			const alreadyLike = !!record.likes.find(like => like.userId === userId)
			if (!alreadyLike)
				record.likes.push({userId})
		}
		else {
			record.likes = record.likes.filter(like => like.userId !== userId)
		}
		await saveRecord(record)
		return record
	}

	async function trashRecord(questionId: string): Promise<void> {
		const record = await getRecordById(questionId)
		record.archive = true
		await saveRecord(record)
	}

	return {
		getRecordById,
		fetchRecords,
		likeRecord,
		saveRecord,
		trashRecord,
	}
}
