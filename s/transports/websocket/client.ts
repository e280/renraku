
import {WscOptions} from "./types.js"
import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {once} from "../../tools/once.js"
import {endpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {WebSocketConduit} from "../messenger/conduits/web-socket.js"
import {waitForSocketOpen} from "../messenger/parts/wait-for-socket-open.js"

export async function webSocketRemote<ServerFns extends Fns>(
		options: WscOptions<ServerFns>
	) {

	const {
		tap,
		socket,
		expose,
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
			fns: expose(serverside, rig),
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

