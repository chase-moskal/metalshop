
import {html} from "lit-element"
import {heart} from "../../system/icons.js"
import {MetalUser} from "../../../types.js"
import {isPremium} from "../../../newbiz/core/user-evaluators.js"

export function renderAuthor({
		likes,
		liked,
		author,
		timePosted,
		handleLikeClick,
		handleUnlikeClick,
		placeholderNickname = "You"
	}: {
		likes: number
		liked: boolean
		timePosted: number
		handleLikeClick: (event: MouseEvent) => void
		handleUnlikeClick: (event: MouseEvent) => void
		placeholderNickname?: string
		author?: MetalUser
	}) {

	const date = new Date(timePosted)
	const datestring = `${date.getFullYear()}`
		+ `-${(date.getMonth() + 1).toString().padStart(2, "0")}`
		+ `-${date.getDate().toString().padStart(2, "0")}`
	const timestring = date.toLocaleTimeString()
	const premium = isPremium(author)
	const avatar = author?.profile?.avatar || null
	const nickname = author?.profile?.nickname || placeholderNickname

	return html`
		<div class="author">
			<metal-avatar .src=${avatar} ?premium=${premium}></metal-avatar>
			<div class="card">
				<p class="nickname">${nickname}</p>
				<div class="details">
					<p class="time" title=${`${datestring} ${timestring}`}>
						${datestring}
					</p>
					<button
						class="likebutton"
						@click=${liked ? handleUnlikeClick : handleLikeClick}
						?data-liked=${liked}
						title="${liked ? "Unlike" : "Like"} question by ${nickname}">
							<span class="like-heart">
								${heart}
							</span>
							<span class="like-number">
								${likes}
							</span>
					</button>
				</div>
			</div>
		</div>
	`
}
