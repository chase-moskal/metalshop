
import {QuestionQuarryTopic, QuestionRow, QuestionLikeRow, QuestionReportRow, MetalUser, UserUmbrellaTopic, Question, Authorizer} from "../../types.js"

import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {concurrent} from "../../toolbox/concurrent.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"

export function makeQuestionQuarry({
		authorize,
		generateId,
		userCanPost,
		userCanArchiveBoard,
		userCanArchiveQuestion,
		userUmbrella,
		questionTable,
		questionLikeTable,
		questionReportTable,
	}: {
		authorize: Authorizer<MetalUser>
		generateId: () => string
		userCanPost: (user: MetalUser) => boolean
		userCanArchiveBoard: (user: MetalUser) => boolean
		userCanArchiveQuestion: (user: MetalUser, questionAuthorUserId: string) => boolean
		userUmbrella: UserUmbrellaTopic<MetalUser>
		questionTable: DbbyTable<QuestionRow>
		questionLikeTable: DbbyTable<QuestionLikeRow>
		questionReportTable: DbbyTable<QuestionReportRow>
	}): QuestionQuarryTopic {

	function makeShortLivedCache() {
		const users: MetalUser[] = []
		return {
			async fetchUser(userId: string) {
				let user = users.find(u => u.userId === userId)
				if (!user) {
					user = await userUmbrella.getUser({userId})
					users.push(user)
				}
				return user
			}
		}
	}

	async function resolveQuestion({row, userId, fetchUser}: {
			row: QuestionRow
			userId: string | undefined
			fetchUser: (userId: string) => Promise<MetalUser>
		}): Promise<Question> {
		const {questionId} = row
		const loggedIn = !!userId
		const {
			author,
			likeCount,
			myLikeCount,
			reportCount,
			myReportCount,
		} = await concurrent({
			author: fetchUser(row.authorUserId),
			likeCount: questionLikeTable.count({
				conditions: and({equal: {questionId}})
			}),
			myLikeCount: loggedIn
				? questionLikeTable.count({
					conditions: and({equal: {questionId, userId}})
				})
				: 0,
			reportCount: questionReportTable.count({
				conditions: and({equal: {questionId}})
			}),
			myReportCount: loggedIn
				? questionReportTable.count({
					conditions: and({equal: {questionId, userId}})
				})
				: 0,
		})
		return {
			questionId: row.questionId,
			author,
			board: row.board,
			content: row.content,
			liked: !!myLikeCount,
			likes: likeCount,
			reports: reportCount,
			reported: !!myReportCount,
			timePosted: row.timePosted,
		}
	}

	return {

		async fetchQuestions({board, accessToken}) {
			const {fetchUser} = makeShortLivedCache()

			let userId: string = undefined
			if (accessToken) userId = (await authorize(accessToken)).userId

			const rows = await questionTable.read({
				conditions: and({equal: {board, archive: false}}),
			})

			const questions = await Promise.all(
				rows.map(row => resolveQuestion({row, userId, fetchUser}))
			)

			return questions
		},

		async postQuestion({draft, accessToken}) {
			const user = await authorize(accessToken)

			const allowed = userCanPost(user)
			if (!allowed) throw new Error("not allowed")

			const {userId} = user
			const row: QuestionRow = {
				authorUserId: userId,
				archive: false,
				board: draft.board,
				content: draft.content,
				timePosted: Date.now(),
				questionId: generateId(),
			}

			await questionTable.create(row)
			return resolveQuestion({row, userId, fetchUser: async() => user})
		},

		async archiveQuestion({questionId, accessToken}) {
			const user = await authorize(accessToken)
			const row = await questionTable.one({
				conditions: and({equal: {questionId}})
			})

			const allowed = userCanArchiveQuestion(user, row.authorUserId)
			if (!allowed) throw new Error("not allowed")

			await questionTable.update({
				conditions: and({equal: {questionId}}),
				write: {archive: true},
			})
		},

		async likeQuestion({like, questionId, accessToken}) {
			const user = await authorize(accessToken)
			const {userId} = user

			const myLikeCount = await questionLikeTable.count({
				conditions: and({equal: {questionId, userId}})
			})
			const alreadyLike = myLikeCount > 0

			// add the like
			if (like && !alreadyLike) {
				await questionLikeTable.create({userId, questionId})
			}

			// remove the like
			else if (!like && alreadyLike) {
				await questionLikeTable.delete({
					conditions: and({equal: {questionId, userId}})
				})
			}

			return resolveQuestion({
				userId,
				fetchUser: async() => user,
				row: await questionTable.one({
					conditions: and({equal: {questionId}})
				}),
			})
		},

		async archiveBoard({board, accessToken}) {
			const user = await authorize(accessToken)

			const allowed = userCanArchiveBoard(user)
			if (!allowed) throw new Error("not allowed")

			await questionTable.update({
				conditions: and({equal: {board}}),
				write: {archive: true},
			})
		},
	}
}
