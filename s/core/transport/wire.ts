
import {Fns} from "../base/types.js"
import {Connection} from "./connect.js"
import {Messenger} from "../messenger/messenger.js"

export function wire<RemoteFns extends Fns>(options: {
		messenger: Messenger<RemoteFns>
		connection: Connection
	}) {

	const {messenger, connection} = options
	messenger.onSend(x => connection.send(x))
	connection.onRecv(x => messenger.recv(x))

	return {
		messenger,
		connection,
		remote: messenger.remote,
	}
}

