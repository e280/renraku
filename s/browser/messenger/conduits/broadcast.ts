
import {disposer} from "@e280/stz"
import {onMessage} from "../parts/helpers.js"
import {Conduit} from "../../../universal/messenger/conduits/conduit.js"

export class BroadcastConduit extends Conduit {
	dispose = disposer().schedule(() => super.dispose())

	constructor(channel: BroadcastChannel) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub(m => channel.postMessage(m)),
			this.sendResponse.sub(m => channel.postMessage(m)),
			onMessage(channel, e => this.recv(e.data, e)),
		)
	}
}

