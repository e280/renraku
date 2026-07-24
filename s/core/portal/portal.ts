
import {Fns} from "../base/types.js"
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export class Portal<RemoteFns extends Fns> {
	close
	#messenger

	constructor({port, autoTransfer, fns, timeout}: {
			port: Port,
			autoTransfer: AutoTransfer,
			fns?: Fns,
			timeout?: number,
		}) {

		this.#messenger = new Messenger<RemoteFns>({
			fns,
			timeout,
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

