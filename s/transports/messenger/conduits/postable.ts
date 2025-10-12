
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {PostableChannel} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class PostableConduit extends Conduit {
	dispose = disposer()

	constructor(channel: PostableChannel) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) => channel.postMessage(m, transfer)),
			this.sendResponse.sub((m, transfer) => channel.postMessage(m, transfer)),
			onMessage(channel, e => this.recv(e.data, e)),
		)
	}
}

