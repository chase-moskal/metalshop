
import {html} from "lit-element"

import {PrepareHandleLikeClick} from "../../types.js"
import {MetalUser, Question} from "../../../types.js"

import {renderAuthor} from "./render-author.js"
import {ascertainOwnership} from "./helpers.js"

export function renderQuestion({
	me,
	question,
	prepareHandleLikeClick,
	prepareHandleDeleteClick,
}: {
	me: MetalUser
	question: Question
	prepareHandleLikeClick: PrepareHandleLikeClick
	prepareHandleDeleteClick: (questionId: string) => (event: MouseEvent) => void
}) {
	const {
		likes,
		liked,
		author,
		content,
		timePosted,
		questionId,
	} = question

	const {authority, mine} = ascertainOwnership(question, me)
	const handleDeleteClick = prepareHandleDeleteClick(questionId)
	const handleLikeClick = prepareHandleLikeClick({like: true, questionId})
	const handleUnlikeClick = prepareHandleLikeClick({like: false, questionId})

	const renderDeleteButton = () => html`
		<button
			class="deletebutton"
			@click=${handleDeleteClick}
			title="Delete question by ${author.profile.nickname}">
				Delete
		</button>
	`

	return html`
		<div
		 class="question"
		 ?data-mine=${mine}
		 data-question-id=${question.questionId}>
			${renderAuthor({
				author,
				timePosted,
				likeInfo: {likes, liked},
				handleLikeClick,
				handleUnlikeClick,
				placeholderNickname: "Unknown",
			})}

			<div class="body">
				<div class="content">${content}</div>
				<div class="controls">

					${mine ? renderDeleteButton() : authority ? html`
						<metal-is-staff>
							${renderDeleteButton()}
						</metal-is-staff>
					` : null}
				</div>
			</div>
		</div>
	`
}
