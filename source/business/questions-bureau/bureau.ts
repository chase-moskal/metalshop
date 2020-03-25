
import {
	User,
	Profile,
	LikeInfo,
	Question,
	VerifyToken,
	AccessToken,
	QuestionsDatalayer,
	QuestionDraft,
	QuestionRecord,
	AuthDealerTopic,
	QuestionsBureauTopic,
	ProfileMagistrateTopic,
} from "../../interfaces.js"

import {generateId} from "../../toolbox/generate-id.js"

export function makeQuestionsBureau({
	verifyToken,
	authDealer,
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
		return await Promise.all(
			records.map(record => resolveQuestion(record))
		)
	}

	async function postQuestion({draft, accessToken}: {
		draft: QuestionDraft
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = await verifyToken(accessToken)
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
		return await resolveQuestion(record)
	}

	async function deleteQuestion({questionId, accessToken}: {
		questionId: string
		accessToken: AccessToken
	}): Promise<void> {
		const {user} = await verifyToken(accessToken)
		const record = await questionsDatalayer.getRecordById(questionId)

		const owner = user.userId === record.authorUserId
		const admin = !!user.claims.admin

		if (owner || admin)
			await questionsDatalayer.trashRecord(questionId)
		else
			throw new Error(`must own the question to trash it`)
	}

	async function likeQuestion({like, questionId, accessToken}: {
		like: boolean
		questionId: string
		accessToken: AccessToken
	}): Promise<Question> {
		const {user} = await verifyToken(accessToken)
		const record = await questionsDatalayer.likeRecord({
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
