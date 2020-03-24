
export interface QuestionRecord {
	time: number
	content: string
	archive: boolean
	boardName: string
	questionId: string
	authorUserId: string
	likes: {userId: string}[]
}
