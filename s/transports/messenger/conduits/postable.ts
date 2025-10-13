
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {Messagable} from "../types.js"
import {onMessage} from "../parts/helpers.js"

export class PostableConduit extends Conduit {
	dispose = disposer()

	constructor(messagable: Messagable) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) => messagable.postMessage(m, transfer)),
			this.sendResponse.sub((m, transfer) => messagable.postMessage(m, transfer)),
			onMessage(messagable, e => this.recv(e.data, e)),
		)
	}
}

