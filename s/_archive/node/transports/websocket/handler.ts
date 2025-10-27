
import {defer} from "@e280/stz"
import {Fns} from "../../../universal/core/types.js"
import {defaults} from "../../../universal/defaults.js"
import {Rtt} from "../../../universal/tools/pingponger.js"
import {bindTap} from "../../../universal/core/taps/bind.js"
import {ipAddress} from "../http/parts/ip-address.js"
import {Messenger} from "../../../universal/messenger/messenger.js"
import {WsHandler, WsHandlerOptions} from "./types.js"
import {RandomUserEmojis} from "../../../universal/tools/random-user-emojis.js"
import {WebsocketConduit} from "../../../universal/messenger/conduits/websocket.js"

export function wsHandler<ClientFns extends Fns>(
		{tap: oTap, accepter, timeout = defaults.timeout}: WsHandlerOptions<ClientFns>
	): WsHandler {

	const emojis = new RandomUserEmojis()

	return async(socket, request) => {
		const ip = ipAddress(request)

		const tap = oTap && bindTap(oTap, {
			meta: {ip, request},
			label: emojis.takeRandom(),
		})

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
				tap?.error({error})
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
			tap,
			rpc: async() => (await deferred.promise).fns,
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

