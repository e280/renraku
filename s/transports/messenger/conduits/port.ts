
import {disposer} from "@e280/stz"
import {Conduit} from "./conduit.js"
import {onMessage} from "../parts/helpers.js"

export class PortConduit extends Conduit {
	dispose = disposer()

	constructor(public port: MessagePort) {
		super()
		this.dispose.schedule(
			this.sendRequest.sub((m, transfer) => port.postMessage(m, transfer ?? [])),
			this.sendResponse.sub((m, transfer) => port.postMessage(m, transfer ?? [])),
			onMessage(port, e => this.recv(e.data, e)),
		)
	}
}

