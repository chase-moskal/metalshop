
import {
	LikeInfo,
	Question,
	TokenData,
	AccessToken,
	AccessPayload,
	QuestionDraft,
	QuestionRecord,
	ClaimsDealerTopic,
	ProfileMagistrateTopic,
	QuestionsBureauActions,
} from "../../interfaces.js"

import {generateId} from "../../toolbox/generate-id.js"

export function createQuestionsBureau({
	actions,
	verifyToken,
	claimsDealer,
	profileMagistrate,
}: {
	actions: QuestionsBureauActions
	claimsDealer: ClaimsDealerTopic
	profileMagistrate: ProfileMagistrateTopic
	verifyToken: (token: AccessToken) => Promise<TokenData<AccessPayload>>
}) {

	//
	// private
	//

	async function resolveQuestion(
		record: QuestionRecord
	): Promise<Question> {
		const {authorUserId: userId} = record
		const author = {
			user: await claimsDealer.getUser({userId}),
			profile: await profileMagistrate.getProfile({userId}),
		}
		const likeInfo: LikeInfo = {
			likes: record.likes.length,
			liked: !!record.likes.find(like => like.userId === userId),
		}
		return {
			author,
			likeInfo,
			time: record.time,
			content: record.content,
			questionId: record.questionId,
		}
	}

	//
	// not private
	//

	async function fetchQuestions({boardName}: {
		boardName: string
	}): Promise<Question[]> {
		const records = await actions.fetchRecords(boardName)
		return await Promise.all(
			records.map(record => resolveQuestion(record))
		)
	}

	async function postQuestion({boardName, draft, accessToken}: {
		boardName: string
		draft: QuestionDraft
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = (await verifyToken(accessToken)).payload
		const {userId: authorUserId} = user
		if (!user.claims.premium)
			throw new Error(`must be premium to post question`)
		const record: QuestionRecord = {
			boardName,
			authorUserId,
			likes: [],
			archive: false,
			time: Date.now(),
			content: draft.content,
			questionId: generateId(),
		}
		await actions.saveRecord(record)
		return await resolveQuestion(record)
	}

	async function deleteQuestion({questionId, accessToken}: {
		questionId: string
		accessToken: AccessToken
	}): Promise<void> {
		const {user} = (await verifyToken(accessToken)).payload
		const record = await actions.getRecordById(questionId)

		const owner = user.userId === record.authorUserId
		const admin = !!user.claims.admin

		if (owner || admin)
			await actions.trashRecord(questionId)
		else
			throw new Error(`must own the question to trash it`)
	}

	async function likeQuestion({like, questionId, accessToken}: {
		like: boolean
		questionId: string
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = (await verifyToken(accessToken)).payload
		const record = await actions.likeRecord({
			like,
			questionId,
			userId: user.userId,
		})
		return await resolveQuestion(record)
	}

	return {
		fetchQuestions,
		postQuestion,
		deleteQuestion,
		likeQuestion,
	}
}
