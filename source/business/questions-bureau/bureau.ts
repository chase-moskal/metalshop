
import {
	User,
	Profile,
	LikeInfo,
	Question,
	VerifyToken,
	AccessToken,
	QuestionDraft,
	QuestionRecord,
	AuthDealerTopic,
	QuestionsDatalayer,
	QuestionsBureauTopic,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

import {generateId} from "../../toolbox/generate-id.js"
import {AccessPayload} from "../../interfaces/tokens.js"

export function makeQuestionsBureau({
	authDealer,
	verifyToken,
	profileMagistrate,
	questionsDatalayer,
}: {
	verifyToken: VerifyToken
	authDealer: AuthDealerTopic
	questionsDatalayer: QuestionsDatalayer
	profileMagistrate: ProfileMagistrateTopic
}): QuestionsBureauTopic {

	//
	// private
	//

	const cache: {users: User[]; profiles: Profile[]} = {
		users: [],
		profiles: [],
	}

	const getUser = async(userId: string): Promise<User> => {
		const cachedUser = cache.users.find(u => u.userId === userId)
		if (cachedUser) return cachedUser
		else {
			const user = await authDealer.getUser({userId})
			cache.users.push(user)
			return user
		}
	}

	const getProfile = async(userId: string): Promise<Profile> => {
		const cachedProfile = cache.profiles.find(p => p.userId === userId)
		if (cachedProfile) return cachedProfile
		else {
			const profile = await profileMagistrate.getProfile({userId})
			cache.profiles.push(profile)
			return profile
		}
	}

	const clearCache = () => {
		cache.users = []
		cache.profiles = []
	}

	async function resolveQuestion(
		record: QuestionRecord
	): Promise<Question> {
		const {authorUserId: userId} = record
		const author = {
			user: await getUser(userId),
			profile: await getProfile(userId),
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

	async function fetchQuestions({board}: {
		board: string
	}): Promise<Question[]> {
		clearCache()
		const records = await questionsDatalayer.fetchRecords(board)
		const questions = await Promise.all(
			records.map(record => resolveQuestion(record))
		)
		clearCache()
		return questions
	}

	async function postQuestion({draft, accessToken}: {
		draft: QuestionDraft
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const {userId: authorUserId} = user
		if (!user.claims.premium)
			throw new Error(`must be premium to post question`)
		const record: QuestionRecord = {
			likes: [],
			authorUserId,
			archive: false,
			time: Date.now(),
			board: draft.board,
			content: draft.content,
			questionId: generateId(),
		}
		await questionsDatalayer.saveRecord(record)
		clearCache()
		const question = await resolveQuestion(record)
		clearCache()
		return question
	}

	async function deleteQuestion({questionId, accessToken}: {
		questionId: string
		accessToken: AccessToken
	}): Promise<void> {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const record = await questionsDatalayer.getRecordById(questionId)

		const owner = user.userId === record.authorUserId
		const admin = !!user.claims.admin

		if (owner || admin)
			await questionsDatalayer.archiveRecord(questionId)
		else
			throw new Error(`not authorized to archive record`)
	}

	async function likeQuestion({like, questionId, accessToken}: {
		like: boolean
		questionId: string
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = await verifyToken<AccessPayload>(accessToken)
		const record = await questionsDatalayer.likeRecord({
			like,
			questionId,
			userId: user.userId,
		})
		clearCache()
		const question = await resolveQuestion(record)
		clearCache()
		return question
	}

	async function purgeQuestions({board, accessToken}: {
		board: string
		accessToken: AccessToken
	}): Promise<void> {
		await verifyToken<AccessPayload>(accessToken)
		await questionsDatalayer.purgeRecords(board)
	}

	return {
		likeQuestion,
		postQuestion,
		fetchQuestions,
		deleteQuestion,
		purgeQuestions,
	}
}
