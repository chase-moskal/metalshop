
import {html} from "lit-element"
import {MetalUser} from "../../../types.js"
import {renderAuthor} from "./render-author.js"
import {QuestionValidation} from "../../types.js"

export function renderQuestionEditor({
		expand,
		draftText,
		validation,
		handlePostClick,
		maxCharacterLimit,
		handleTextAreaChange,
		author = {
			userId: "",
			claims: {
				admin: false,
				staff: undefined,
				banUntil: undefined,
				banReason: undefined,
				premiumUntil: undefined,
				joined: Date.now() - (10 * (1000 * 60 * 60 * 24)),
			},
			profile: {
				avatar: null,
				userId: "",
				tagline: "",
				nickname: "",
			},
		},
	}: {
		expand: boolean
		draftText: string
		maxCharacterLimit: number
		validation: QuestionValidation
		handlePostClick: (event: MouseEvent) => void
		handleTextAreaChange: (event: Event) => void
		author?: MetalUser
	}) {

	const {message, postable, angry} = validation
	const invalid = !!message

	return html`
		<div class="question editor">
			${renderAuthor({
				author,
				likeInfo: undefined,
				timePosted: Date.now(),
				handleLikeClick: () => {},
				handleUnlikeClick: () => {},
			})}
			<div class="body">
				<textarea
					class="content"
					placeholder="type your question here"
					maxlength=${maxCharacterLimit}
					?data-expand=${expand}
					@change=${handleTextAreaChange}
					@keyup=${handleTextAreaChange}
					.value=${draftText}
				></textarea>
				<div class="controls">
					${message
						? html`
							<p
								class="message"
								?data-angry=${angry}
								?data-active=${invalid}>
									${message}
							</p>
						` : null}
					<button
						?disabled=${!postable}
						@click=${handlePostClick}
						class="postbutton"
						title="Post your question to the board">
							Post
					</button>
				</div>
			</div>
		</div>
	`
}
