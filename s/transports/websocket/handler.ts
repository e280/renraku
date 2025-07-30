
import {defer} from "@e280/stz"
import {Fns} from "../../core/types.js"
import {defaults} from "../../defaults.js"
import {Rtt} from "../../tools/pingponger.js"
import {makeEndpoint} from "../../core/endpoint.js"
import {ipAddress} from "../../tools/ip-address.js"
import {Messenger} from "../messenger/messenger.js"
import {WsHandler, WsHandlerOptions} from "./types.js"
import {WebsocketConduit} from "../messenger/conduits/websocket.js"

export function wsHandler<ClientFns extends Fns>(
		{tap, accepter, timeout = defaults.timeout}: WsHandlerOptions<ClientFns>
	): WsHandler {

	return async(socket, request) => {
		const ip = ipAddress(request)
		const taps = tap?.webSocket({ip, request})

		function detach() {
			conduit.dispose()
			messenger.dispose()
		}

		async function kill() {
			detach()
			if (socket.readyState === 1)
				socket.close()
			const {disconnected} = await deferred.promise
			disconnected()
		}

		const conduit = new WebsocketConduit({
			socket,
			timeout,
			onClose: kill,
			onError: error => {
				taps?.remote?.error(error)
				kill()
			},
		})

		const deferred = defer<{
			fns: ClientFns
			disconnected: () => void
		}>()

		const messenger = new Messenger<ClientFns>({
			conduit,
			timeout,
			tap: taps?.remote,
			getLocalEndpoint: async() => makeEndpoint({
				fns: (await deferred.promise).fns,
				tap: taps?.local,
			}),
		})

		await conduit.pingponger.onRtt.next()

		try {
			deferred.resolve(await accepter({
				ip,
				socket,
				request,
				remote: messenger.remote,
				rtt: new Rtt(conduit.pingponger),
				detach,
				close: kill,
			}))
		}
		catch (error) {
			deferred.reject(error)
		}
	}
}

