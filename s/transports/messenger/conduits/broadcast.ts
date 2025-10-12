
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {onMessage} from "../parts/helpers.js"

export class BroadcastConduit extends Conduit {
	dispose = disposer()

	constructor(channel: BroadcastChannel) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub(m => channel.postMessage(m)),
			this.sendResponse.sub(m => channel.postMessage(m)),
			onMessage(channel, e => this.recv(e.data, e)),
		)
	}
}

