
import {Fns} from "../../../universal/core/types.js"
import {defaults} from "../../../universal/defaults.js"
import {Rtt} from "../../../universal/tools/pingponger.js"
import {Messenger} from "../../../universal/messenger/messenger.js"
import {Connection, WsConnectOptions} from "./types.js"
import {WebsocketConduit} from "../../../universal/messenger/conduits/websocket.js"
import {waitForSocketOpen} from "../../../universal/messenger/parts/wait-for-socket-open.js"

export async function wsConnect<RemoteFns extends Fns>(
		options: WsConnectOptions<RemoteFns>
	): Promise<Connection<RemoteFns>> {

	const {
		tap,
		socket,
		timeout = defaults.timeout,
		connector,
	} = options

	await waitForSocketOpen(socket, timeout)

	const detach = () => {
		conduit.dispose()
		messenger.dispose()
	}

	const conduit = new WebsocketConduit({
		socket,
		timeout,
		onClose: detach,
		onError: detach,
	})

	const kill = () => {
		detach()
		socket.close()
	}

	const rtt = new Rtt(conduit.pingponger)

	const messenger = new Messenger<RemoteFns>({
		tap,
		conduit,
		timeout,
		rpc: async() => connret.fns,
	})

	const connection: Connection<RemoteFns> = {
		rtt,
		socket,
		remote: messenger.remote,
		detach,
		close: kill,
	}

	const connret = await connector(connection)
	await conduit.pingponger.onRtt.next()

	return connection
}

