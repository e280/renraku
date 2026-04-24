
import {Fns} from "../base/types.js"
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export class Portal<RemoteFns extends Fns> {
	close
	#conduit

	constructor(
			port: Port,
			autoTransfer: AutoTransfer,
			options: {fns?: Fns, timeout?: number} = {},
		) {

		this.#conduit = new Messenger<RemoteFns>({
			fns: options.fns,
			timeout: options.timeout,
			send: msg => port.postMessage(msg, autoTransfer(msg)),
		})

		port.addEventListener("message", event => this.#conduit.recv(event.data))
		port.start()
		this.close = () => port.close()
	}

	get remote() {
		return this.#conduit.remote
	}
}

