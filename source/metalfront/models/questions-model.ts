
import {observable, action, runInAction} from "mobx"

import {MetalUser, Question, QuestionQuarryTopic} from "../../types.js"
import {GetAuthContext, AuthPayload, QuestionQuarryUi} from "../types.js"

import * as loading from "../toolbox/loading.js"

export class QuestionsModel {
	#getAuthContext: GetAuthContext<MetalUser>
	#questionQuarry: QuestionQuarryTopic

	@observable questions: Question[] = []

	constructor(options: {
			questionQuarry: QuestionQuarryTopic
		}) {
		this.#questionQuarry = options.questionQuarry
	}

	////////

	async handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		this.#getAuthContext = loading.payload(authLoad)?.getAuthContext
		if (this.#getAuthContext) {
			const {user} = await this.#getAuthContext()
	
			// update author for our questions
			runInAction(() => {
				for (const question of this.questions) {
					if (question.author.userId === user.userId) {
						question.author = user
					}
				}
			})
		}
	}

	fetchCachedQuestions = (board: string) => this.questions.filter(
		question => question.board === board
	)

	questionQuarryUi: QuestionQuarryUi = {
		fetchQuestions: async({board}) => {
			const questions = await this.#questionQuarry.fetchQuestions({board})
			for (const question of questions) this.cacheQuestion(question)
			return questions
		},
		postQuestion: async(options) => {
			const question = await this.#questionQuarry.postQuestion(
				await this.addTokenToOptions(options)
			)
			this.cacheQuestion(question)
			return question
		},
		archiveQuestion: async(options) => {
			await this.#questionQuarry.archiveQuestion(
				await this.addTokenToOptions(options)
			)
			this.deleteLocalQuestion(options.questionId)
		},
		likeQuestion: async(options) => {
			const question = await this.#questionQuarry.likeQuestion(
				await this.addTokenToOptions(options)
			)
			const {liked, likes} = question
			const {questionId} = options
			this.likeLocalQuestion(questionId, liked, likes)
			return question
		},
		archiveBoard: async(options: {board: string}) => {
			const optionsWithToken = await this.addTokenToOptions(options)
			await this.#questionQuarry.archiveBoard(optionsWithToken)
			this.deleteAllCachedQuestions()
		},
	}

	////////

	 @action.bound
	private cacheQuestion(question: Question) {
		const existing = this.getLocalQuestion(question.questionId)
		if (existing) Object.assign(existing, question)
		else this.questions.push(question)
	}

	 @action.bound
	private deleteLocalQuestion(questionId: string) {
		this.questions = this.questions.filter(
			question => question.questionId !== questionId
		)
	}

	 @action.bound
	private likeLocalQuestion(
			questionId: string,
			liked: boolean,
			likes: number,
		) {
		const question = this.getLocalQuestion(questionId)
		question.liked = liked
		question.likes = likes
	}

	 @action.bound
	private deleteAllCachedQuestions() {
		this.questions = []
	}

	private getLocalQuestion = (questionId: string) => questionId
		? this.questions.find(question => question.questionId === questionId)
		: null

	private addTokenToOptions = async<O extends {}>(options: O) => {
		const {accessToken} = await this.#getAuthContext()
		return {...options, accessToken}
	}
}
