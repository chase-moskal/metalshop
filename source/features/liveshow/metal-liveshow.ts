
import {cancel} from "../../metalfront/system/icons.js"
import {select} from "../../metalfront/toolbox/selects.js"
import * as loading from "../../metalfront/toolbox/loading.js"
import {mixinStyles} from "../../metalfront/framework/mixin-styles.js"
import {MetalshopComponent, property, html} from "../../metalfront/framework/metalshop-component.js"

import styles from "./liveshow.css.js"
import {LiveshowViewModel} from "./liveshow-view-model.js"
import {LiveshowShare, LiveshowPrivilegeLevel} from "./liveshow-types.js"

 @mixinStyles(styles)
export class MetalLiveshow extends MetalshopComponent<LiveshowShare> {

	 @property({type: String, reflect: true})
	["video-label"]: string

	private _viewModel: LiveshowViewModel
	private _viewModelDispose: () => void

	firstUpdated(props) {
		super.firstUpdated(props)
		const {["video-label"]: label} = this
		const {viewModel, dispose} = this.share.makeViewModel({label})
		this._viewModel = viewModel
		this._viewModelDispose = () => {
			this._viewModel = null
			dispose()
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		if (this._viewModelDispose) this._viewModelDispose()
	}

	render() {
		const {authLoad} = this.share
		const privilege = this._viewModel?.privilege
		return html`
			<iron-loading .load=${authLoad}>
				${this.renderPrivilegeBox(privilege)}
			</iron-loading>
		`
	}

	private renderPrivilegeBox(privilege: LiveshowPrivilegeLevel) {
		const {validationMessage} = this._viewModel || {}
		switch (privilege) {
			case LiveshowPrivilegeLevel.Unknown: return html`
				<slot name="unknown">
					<h2>Private video</h2>
					<p>You must be logged in to view this video</p>
				</slot>
				<div class="ghostplayer">${cancel}</div>
			`
			case LiveshowPrivilegeLevel.Unprivileged: return html`
				<slot name="unprivileged">
					<h2>Private video</h2>
					<p>Your account does not have privilege to watch this video</p>
				</slot>
				<div class="ghostplayer">${cancel}</div>
			`
			case LiveshowPrivilegeLevel.Privileged: return html`
				<slot></slot>
				${this._renderViewer()}
				<metal-is-staff fancy class="adminpanel coolbuttonarea formarea">
					<div class="inputarea">
						<input
							type="text"
							name="vimeostring"
							placeholder="vimeo link or id"
							/>
						<button @click=${this._handleClickUpdateLivestream}>
							update
						</button>
					</div>
					${validationMessage && html`
						<p class="error">${validationMessage}</p>
					`}
				</metal-is-staff>
			`
		}
	}

	private _handleClickUpdateLivestream = () => {
		const input = select<HTMLInputElement>(
			"input[name=vimeostring]",
			this.shadowRoot
		)
		this._viewModel.updateVideo(input.value)
		input.value = ""
	}

	private _renderViewer() {
		const {vimeoId} = loading.payload(this._viewModel.videoLoad) || {}
		const query = "?color=00a651&title=0&byline=0&portrait=0&badge=0"
		return vimeoId ? html`
			<div class="viewer">
				<iframe
					frameborder="0"
					allowfullscreen
					allow="autoplay; fullscreen"
					src="https://player.vimeo.com/video/${vimeoId}${query}"
				></iframe>
			</div>
		` : html`
			<div class="missing ghostplayer">
				<p>video missing</p>
			</div>
		`
	}
}
