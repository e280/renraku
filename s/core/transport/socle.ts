
import {Connection} from "./connect.js"
import {Messenger} from "../messenger/messenger.js"

export type Socle = Awaited<ReturnType<typeof socle>>

export function socle<M extends Messenger>(options: {
		messenger: M
		connection: Connection
	}) {

	const {messenger, connection} = options
	messenger.onSend(x => connection.send(x))
	connection.onRecv(x => messenger.recv(x as any))

	return {
		messenger,
		connection,
		remote: messenger.remote,
	}
}

