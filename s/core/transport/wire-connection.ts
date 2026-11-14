
import {disposer} from "@e280/stz"
import {Fns} from "../base/types.js"
import {Connection} from "./connect.js"
import {ConnectionWiring} from "./types.js"
import {Messenger} from "../messenger/messenger.js"

export function wireConnection<RemoteFns extends Fns>(options: {
		messenger: Messenger<RemoteFns>
		connection: Connection
	}): ConnectionWiring<RemoteFns> {

	const {messenger, connection} = options
	const {schedule, dispose: unwire} = disposer()

	schedule(messenger.onSend(x => connection.send(x)))
	schedule(connection.onRecv(x => messenger.recv(x)))

	return {
		messenger,
		connection,
		remote: messenger.remote,
		unwire,
		dispose: () => {
			unwire()
			messenger.dispose()
			connection.close()
		},
	}
}

