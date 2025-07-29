
import {once} from "@e280/stz"

import {Fns} from "../../core/types.js"
import {defaults} from "../../defaults.js"
import {WsRemoteOptions} from "./types.js"
import {makeEndpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {WebSocketConduit} from "../messenger/conduits/web-socket.js"
import {waitForSocketOpen} from "../messenger/parts/wait-for-socket-open.js"
import {Rtt} from "../../tools/pingponger.js"

export async function wsClient<ServerFns extends Fns>(
		options: WsRemoteOptions<ServerFns>
	) {

	const {
		tap,
		socket,
		rpc,
		disconnected,
		timeout = defaults.timeout,
	} = options

	await waitForSocketOpen(socket, timeout)

	const disconnect = once(disconnected)

	const conduit = new WebSocketConduit({
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

