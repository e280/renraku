
import {disposer} from "@e280/stz"
import {onMessage} from "../parts/helpers.js"
import {Conduit} from "../../../universal/messenger/conduits/conduit.js"

export class PortConduit extends Conduit {
	dispose = disposer().schedule(() => super.dispose())

	constructor(public port: MessagePort) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) => port.postMessage(m, transfer ?? [])),
			this.sendResponse.sub((m, transfer) => port.postMessage(m, transfer ?? [])),
			onMessage(port, e => this.recv(e.data, e)),
		)
	}
}

