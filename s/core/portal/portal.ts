
import {disposer, ev} from "@e280/stz"
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export function makePortal<M extends Messenger<any>>(options: {
		port: Port
		messenger: M
		autoTransfer: AutoTransfer
	}) {

	const {port, messenger, autoTransfer} = options
	const dispose = disposer()

	dispose.schedule(
		messenger.onSend(x => port.postMessage(x, autoTransfer(x))),
		ev(port, {message: event => messenger.recv(event.data)}),
	)

	port.start()

	return {
		port,
		messenger,
		remote: messenger.remote,
		dispose: () => dispose(),
	}
}

