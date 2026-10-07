
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export function portal<M extends Messenger<any>>(options: {
		port: Port
		messenger: M
		autoTransfer: AutoTransfer
	}) {

	const {port, messenger, autoTransfer} = options

	messenger.onSend(x => port.postMessage(x, autoTransfer(x)))

	port.addEventListener("message", event => messenger.recv(event.data as any))
	port.start()

	return {
		port,
		messenger,
		remote: messenger.remote,
		close: () => port.close(),
	}
}

