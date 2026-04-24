
import {Fns} from "../base/types.js"
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export class Portal<RemoteFns extends Fns> {
	close
	#messenger

	constructor(
			port: Port,
			autoTransfer: AutoTransfer,
			options: {fns?: Fns, timeout?: number} = {},
		) {

		this.#messenger = new Messenger<RemoteFns>({
			fns: options.fns,
			timeout: options.timeout,
			send: msg => port.postMessage(msg, autoTransfer(msg)),
		})

		port.addEventListener("message", event => this.#messenger.recv(event.data))
		port.start()
		this.close = () => port.close()
	}

	get remote() {
		return this.#messenger.remote
	}
}

