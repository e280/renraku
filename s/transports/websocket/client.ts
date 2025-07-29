
import {once} from "@e280/stz"

import {Fns} from "../../core/types.js"
import {defaults} from "../../defaults.js"
import {WsRemoteOptions} from "./types.js"
import {Rtt} from "../../tools/pingponger.js"
import {makeEndpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {WebsocketConduit} from "../messenger/conduits/websocket.js"
import {waitForSocketOpen} from "../messenger/parts/wait-for-socket-open.js"

export async function wsClient<ServerFns extends Fns>(
		options: WsRemoteOptions<ServerFns>
	) {

	const {
		tap,
		socket,
		timeout = defaults.timeout,
		rpc,
		disconnected,
	} = options

	await waitForSocketOpen(socket, timeout)

	const disconnect = once(disconnected)

	const conduit = new WebsocketConduit({
		socket,
		timeout,
		onClose: disconnect,
		onError: disconnect,
	})

	const messenger = new Messenger<ServerFns>({
		conduit,
		tap,
		timeout,
		getLocalEndpoint: (serverside) => makeEndpoint({
			tap,
			fns: rpc(serverside),
		}),
	})

	const detach = () => {
		conduit.dispose()
		messenger.dispose()
	}

	const close = () => {
		detach()
		socket.close()
	}

	// wait first ping result
	await conduit.pingponger.onRtt.next()

	return {
		close,
		detach,
		socket: options.socket,
		remote: messenger.remote,
		rtt: new Rtt(conduit.pingponger),
	}
}

