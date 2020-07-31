
import {html} from "lit-element"
import {heart} from "../../system/icons.js"
import {MetalUser} from "../../../types.js"
import {isPremium} from "../../../business/core/user-evaluators.js"

export function renderAuthor({
		author,
		likeInfo,
		timePosted,
		handleLikeClick,
		handleUnlikeClick,
		placeholderNickname = "You"
	}: {
		timePosted: number
		likeInfo: undefined | {
			likes: number
			liked: boolean
		}
		handleLikeClick: (event: MouseEvent) => void
		handleUnlikeClick: (event: MouseEvent) => void
		author?: MetalUser
		placeholderNickname?: string
	}) {

	const date = new Date(timePosted)
	const datestring = `${date.getFullYear()}`
		+ `-${(date.getMonth() + 1).toString().padStart(2, "0")}`
		+ `-${date.getDate().toString().padStart(2, "0")}`
	const timestring = date.toLocaleTimeString()
	const premium = isPremium(author)
	const avatar = author?.profile?.avatar || null
	const nickname = author?.profile?.nickname || placeholderNickname
	const tagline = author?.profile?.tagline || ""

	return html`
		<div class="author">
			<cobalt-avatar .user=${author} rounded></cobalt-avatar>
			<div class="details">
				<p class="time" title=${`${datestring} ${timestring}`}>
					${datestring}
				</p>
				<cobalt-card .user=${author}></cobalt-card>
				${likeInfo ? html`
					<button
						class="likebutton"
						?data-liked=${likeInfo.liked}
						@click=${likeInfo.liked ? handleUnlikeClick : handleLikeClick}
						title="${likeInfo.liked ? "Unlike" : "Like"} question by ${nickname}"
						>
							<span class="like-heart">
								${heart}
							</span>
							<span class="like-number">
								${likeInfo.likes}
							</span>
					</button>
				` : null}
			</div>
		</div>
	`
}
