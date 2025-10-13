
import {disposer} from "@e280/stz"
import {Messagable} from "../types.js"
import {onMessage} from "../parts/helpers.js"
import {Conduit} from "../../../universal/messenger/conduits/conduit.js"

export class PostableConduit extends Conduit {
	dispose = disposer().schedule(() => super.dispose())

	constructor(messagable: Messagable) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) => messagable.postMessage(m, transfer)),
			this.sendResponse.sub((m, transfer) => messagable.postMessage(m, transfer)),
			onMessage(messagable, e => this.recv(e.data, e)),
		)
	}
}

