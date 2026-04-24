
import {Conduit} from "./conduit.js"
import {Fns} from "../parts/types.js"
import {autoTransfer} from "./auto-transfer.js"

export class Portal<RemoteFns extends Fns> {
	close
	#conduit

	constructor(
			port: MessagePort,
			options: {fns?: Fns, timeout?: number} = {},
		) {

		this.#conduit = new Conduit<RemoteFns>({
			fns: options.fns,
			timeout: options.timeout,
			send: msg => port.postMessage(msg, autoTransfer(msg)),
		})

		const onmessage = (event: MessageEvent) => this.#conduit.recv(event.data)
		port.addEventListener("message", onmessage)
		port.start()
		this.close = () => port.close()
	}

	get remote() {
		return this.#conduit.remote
	}
}

