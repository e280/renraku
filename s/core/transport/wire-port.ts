
import {disposer, ev} from "@e280/stz"
import {Fns} from "../base/types.js"
import {Messenger} from "../messenger/messenger.js"
import {AutoTransfer, Port, PortWiring} from "./types.js"

export function wirePort<RemoteFns extends Fns>(options: {
		port: Port
		messenger: Messenger<RemoteFns>
		autoTransfer: AutoTransfer
	}): PortWiring<RemoteFns> {

	const {port, messenger, autoTransfer} = options
	const {schedule, dispose} = disposer()

	schedule(messenger.onSend(x => port.postMessage(x, autoTransfer(x))))
	schedule(ev(port, {message: event => messenger.recv(event.data)}))

	port.start()

	return {
		port,
		messenger,
		remote: messenger.remote,
		dispose,
	}
}

