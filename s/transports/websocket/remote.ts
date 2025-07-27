
import {once} from "@e280/stz"

import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {endpoint} from "../../core/endpoint.js"
import {WebSocketRemoteOptions} from "./types.js"
import {Messenger} from "../messenger/messenger.js"
import {WebSocketConduit} from "../messenger/conduits/web-socket.js"
import {waitForSocketOpen} from "../messenger/parts/wait-for-socket-open.js"

export async function webSocketRemote<ServerFns extends Fns>(
		options: WebSocketRemoteOptions<ServerFns>
	) {

	const {
		tap,
		socket,
		rpc,
		onDisconnect,
		timeout = defaults.timeout,
	} = options

	await waitForSocketOpen(socket, timeout)

	const disconnect = once(onDisconnect)

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
		getLocalEndpoint: (serverside, rig) => endpoint({
			tap,
			fns: rpc(serverside, rig),
		}),
	})

	const dispose = () => {
		conduit.dispose()
		messenger.dispose()
	}

	return {
		dispose,
		remote: messenger.remote,
	}
}

