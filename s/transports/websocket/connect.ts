
import {pub} from "@e280/stz"
import {Fns} from "../../core/types.js"
import {defaults} from "../../defaults.js"
import {Rtt} from "../../tools/pingponger.js"
import {Messenger} from "../messenger/messenger.js"
import {Connection, WsConnectOptions} from "./types.js"
import {WebsocketConduit} from "../messenger/conduits/websocket.js"
import {waitForSocketOpen} from "../messenger/parts/wait-for-socket-open.js"

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

	const onDisconnect = pub<[error?: any]>(detach)
	onDisconnect.subscribe(options.disconnected ?? (() => {}))

	const conduit = new WebsocketConduit({
		socket,
		timeout,
		onClose: onDisconnect,
		onError: onDisconnect,
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
	onDisconnect.subscribe(connret.disconnected)

	await conduit.pingponger.onRtt.next()
	return connection
}

