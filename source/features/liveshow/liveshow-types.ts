
import {ApiShape} from "renraku/dist/interfaces.js"

import {AsDbbyRow} from "../../toolbox/dbby/dbby-types.js"
import {AuthPayload, User} from "../../metalfront/types.js"
import * as loading from "../../metalfront/toolbox/loading.js"

import {makeLiveshowApi} from "./liveshow-api.js"
import {LiveshowViewModel} from "./liveshow-view-model.js"

export type LiveshowApi = ReturnType<typeof makeLiveshowApi>
export type LiveshowTopic = LiveshowApi["liveshowTopic"]

export enum LiveshowPrivilegeLevel {
	Unknown,
	Unprivileged,
	Privileged,
}

export interface LiveshowShare {
	authLoad: loading.Load<AuthPayload<User>>
	makeViewModel(options: {label: string}): {
		dispose: () => void
		viewModel: LiveshowViewModel
	}
}

export type LiveshowRow = AsDbbyRow<{
	label: string
	vimeoId: string
}>
