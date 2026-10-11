
import {disposer, ev} from "@e280/stz"
import {Fns} from "../base/types.js"
import {AutoTransfer, Port} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export function makePortal<RemoteFns extends Fns>(options: {
		port: Port
		messenger: Messenger<RemoteFns>
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

