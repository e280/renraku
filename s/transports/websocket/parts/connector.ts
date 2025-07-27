
import {Fns} from "../../../core/types.js"
import {defaults} from "../../defaults.js"
import {endpoint} from "../../../core/endpoint.js"
import {ipAddress} from "../../../tools/ip-address.js"
import {Messenger} from "../../messenger/messenger.js"
import {WsConnector, WsConnectorOptions} from "../types.js"
import {simplifyHeaders} from "../../../tools/simple-headers.js"
import {WebSocketConduit} from "../../messenger/conduits/web-socket.js"

export function webSocketConnector<ClientFns extends Fns>(
		{tap, accept, timeout = defaults.timeout}: WsConnectorOptions<ClientFns>
	): WsConnector {

	return async(socket, request) => {
		const ip = ipAddress(request)
		const headers = simplifyHeaders(request.headers)
		const taps = tap?.webSocket({ip, headers, request})

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
				fns: expose(clientside, rig),
				tap: taps?.local,
			}),
		})

		const {expose, onDisconnect} = accept({
			ip,
			socket,
			request,
			headers,
			clientside: messenger.remote,
			close: kill,
		})
	}
}

