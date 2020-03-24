
export interface QuestionRecord {
	time: number
	board: string
	content: string
	archive: boolean
	questionId: string
	authorUserId: string
	likes: {userId: string}[]
}
