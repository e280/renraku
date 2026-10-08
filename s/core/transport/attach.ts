
import {Connection} from "./jsock4.js"
import {Messenger} from "../messenger/messenger.js"

export function attach<M extends Messenger>(options: {
		messenger: M
		connection: Connection
	}) {

	const {messenger, connection} = options
	messenger.onSend(x => connection.send(x))
	connection.onRecv(x => messenger.recv(x))

	return {
		messenger,
		connection,
	}
}

