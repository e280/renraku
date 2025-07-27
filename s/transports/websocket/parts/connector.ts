
import {Fns} from "../../../core/types.js"
import {defaults} from "../../defaults.js"
import {endpoint} from "../../../core/endpoint.js"
import {ipAddress} from "../../../tools/ip-address.js"
import {Messenger} from "../../messenger/messenger.js"
import {WsConnector, WsConnectorOptions} from "../types.js"
import {WebSocketConduit} from "../../messenger/conduits/web-socket.js"

export function webSocketConnector<ClientFns extends Fns>(
		{tap, accept, timeout = defaults.timeout}: WsConnectorOptions<ClientFns>
	): WsConnector {

	return async(socket, request) => {
		const ip = ipAddress(request)
		const taps = tap?.webSocket({ip, request})

		function kill() {
			if (socket.readyState === 1)
				socket.close()
			conduit.dispose()
			messenger.dispose()
			onDisconnect()
		}

		const conduit = new WebSocketConduit({
			socket,
			timeout,
			onClose: kill,
			onError: error => {
				taps?.remote?.error(error)
				kill()
			},
		})

		const messenger = new Messenger<ClientFns>({
			conduit,
			timeout,
			tap: taps?.remote,
			getLocalEndpoint: (clientside, rig) => endpoint({
				fns: rpc(clientside, rig),
				tap: taps?.local,
			}),
		})

		const {rpc, disconnected: onDisconnect} = accept({
			ip,
			socket,
			request,
			clientside: messenger.remote,
			close: kill,
		})
	}
}

