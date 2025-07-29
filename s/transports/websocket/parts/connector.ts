
import {Fns} from "../../../core/types.js"
import {defaults} from "../../../defaults.js"
import {makeEndpoint} from "../../../core/endpoint.js"
import {ipAddress} from "../../../tools/ip-address.js"
import {Messenger} from "../../messenger/messenger.js"
import {WsConnector, WsConnectorOptions} from "../types.js"
import {WebSocketConduit} from "../../messenger/conduits/web-socket.js"
import {Rtt} from "../../../tools/pingponger.js"

export function wsConnector<ClientFns extends Fns>(
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
			disconnected()
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
			getLocalEndpoint: remote => makeEndpoint({
				fns: rpc(remote),
				tap: taps?.local,
			}),
		})

		// wait for first ping result
		await conduit.pingponger.onRtt.next()

		const {rpc, disconnected} = accept({
			ip,
			socket,
			request,
			remote: messenger.remote,
			rtt: new Rtt(conduit.pingponger),
			close: kill,
		})
	}
}

