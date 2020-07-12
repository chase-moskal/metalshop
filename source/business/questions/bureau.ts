
import {
	User,
	Profile,
	LikeInfo,
	Question,
	VerifyToken,
	AccessToken,
	QuestionDraft,
	QuestionTable,
	QuestionRecord,
	AuthDealerTopic,
	QuestionsBureauTopic,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

import {generateId} from "../../toolbox/generate-id.js"
import {AccessPayload} from "../../interfaces/tokens.js"

interface Cache {
	fetchUser(userId: string): Promise<User>
	fetchProfile(userId: string): Promise<Profile>
}

export function makeQuestionsBureau({
		authDealer,
		verifyToken,
		questionTable,
		profileMagistrate,
	}: {
		verifyToken: VerifyToken
		authDealer: AuthDealerTopic
		questionTable: QuestionTable
		profileMagistrate: ProfileMagistrateTopic
	}): QuestionsBureauTopic {

	//
	// private
	//

	function makeCache(): Cache {
		const users: User[] = []
		const profiles: Profile[] = []
		return {
			async fetchUser(userId: string) {
				let user = users.find(u => u.userId === userId)
				if (!user) {
					user = await authDealer.getUser({userId})
					users.push(user)
				}
				return user
			},
			async fetchProfile(userId: string) {
				let profile = profiles.find(p => p.userId === userId)
				if (!profile) {
					profile = await profileMagistrate.getProfile({userId})
					profiles.push(profile)
				}
				return profile
			},
		}
	}

	async function resolveQuestion(
			record: QuestionRecord,
			cache: Cache
		): Promise<Question> {
		const {authorUserId: userId} = record
		const author = {
			user: await cache.fetchUser(userId),
			profile: await cache.fetchProfile(userId),
		}
		const likeInfo: LikeInfo = {
			likes: record.likes.length,
			liked: !!record.likes.find(like => like.userId === userId),
		}
		return {
			author,
			likeInfo,
			time: record.time,
			board: record.board,
			content: record.content,
			questionId: record.questionId,
		}
	}

	//
	// not private
	//

	async function fetchQuestions({board}: {board: string}): Promise<Question[]> {
		const cache = makeCache()
		const records = await questionTable.read({
			conditions: {equal: {board, archive: false}}
		})
		const questions = await Promise.all(
			records.map(record => resolveQuestion(record, cache))
		)
		return questions
	}

	async function postQuestion({draft, accessToken}: {
			draft: QuestionDraft
			accessToken: AccessToken
		}): Promise<Question> {

		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId: authorUserId} = user
		if (!user.claims.premium) throw new Error(`must be premium to post question`)

		const record: QuestionRecord = {
			likes: [],
			authorUserId,
			archive: false,
			time: Date.now(),
			board: draft.board,
			content: draft.content,
			questionId: generateId(),
		}

		await questionTable.update({
			conditions: {equal: {questionId: record.questionId}},
			upsert: record,
		})

		return resolveQuestion(record, makeCache())
	}

	async function archiveQuestion({questionId, accessToken}: {
			questionId: string
			accessToken: AccessToken
		}): Promise<void> {

		const {user} = await verifyToken<AccessPayload>(accessToken)
		const record = await questionTable.one({conditions: {equal: {questionId}}})

		const owner = user.userId === record.authorUserId
		const admin = !!user.claims.admin

		if (owner || admin)
			await questionTable.update({
				conditions: {equal: {questionId}},
				write: {archive: true}
			})
		else
			throw new Error(`not authorized to archive record`)
	}

	async function likeQuestion({like, questionId, accessToken}: {
			like: boolean
			questionId: string
			accessToken: AccessToken
		}): Promise<Question> {

		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId} = user
		const record = await questionTable.one({
			conditions: {equal: {questionId}}
		})
		const alreadyLike = record.likes.find(
			likeEntry => likeEntry.userId === userId
		)

		// add the like
		if (like && !alreadyLike) record.likes.push({userId})

		// remove the like
		if (!like && alreadyLike) record.likes = record.likes.filter(
			likeEntry => likeEntry.userId !== userId
		)

		return resolveQuestion(record, makeCache())
	}

	async function archiveBoard({board, accessToken}: {
			board: string
			accessToken: AccessToken
		}): Promise<void> {

		const {user} = await verifyToken<AccessPayload>(accessToken)
		const admin = !!user.claims.admin

		await questionTable.update({
			conditions: {equal: {board}},
			write: {archive: true},
		})
	}

	return {
		likeQuestion,
		postQuestion,
		archiveBoard,
		fetchQuestions,
		archiveQuestion,
	}
}
