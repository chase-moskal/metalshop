
import {MetalUser} from "../../types.js"
import {pubsub} from "../../toolbox/pubsub.js"
import {AuthPayload} from "../../metalfront/types.js"
import * as loading from "../../metalfront/toolbox/loading.js"

import {LiveshowTopic} from "./liveshow-types.js"
import {LiveshowViewModel} from "./liveshow-view-model.js"

export type HandleAuthUpdate = (auth: loading.Load<AuthPayload<MetalUser>>) => Promise<void>

export class LiveshowModel {
	private liveshowTopic: LiveshowTopic

	constructor(options: {
			liveshowTopic: LiveshowTopic
		}) {
		this.liveshowTopic = options.liveshowTopic
	}

	//
	// pubsub to mirror auth load to view models
	//

	authLoadPubsub = pubsub<HandleAuthUpdate>()

	handleAuthLoad(authLoad: loading.Load<AuthPayload<MetalUser>>) {
		this.authLoadPubsub.publish(authLoad)
	}

	dispose() {
		this.authLoadPubsub.dispose()
	}

	//
	// function to create new view models
	//

	makeViewModel = ({label}: {label: string}): {
			dispose: () => void,
			viewModel: LiveshowViewModel,
		} => {
		const {liveshowTopic} = this
		const viewModel = new LiveshowViewModel({
			label,
			liveshowTopic,
		})
		const dispose = this.authLoadPubsub.subscribe(viewModel.handleAuthLoad)
		return {
			dispose,
			viewModel,
		}
	}
}
