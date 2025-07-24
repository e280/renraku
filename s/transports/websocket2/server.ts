
import * as ws from "ws"
import * as http from "http"
import {sub} from "@e280/stz"

import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {Wss, WssOptions} from "./types.js"
import {endpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {ipAddress} from "../../tools/ip-address.js"
import {WebSocketConduit} from "../messenger/index.js"
import {simplifyHeaders} from "../../tools/simple-headers.js"
import {allowCors} from "../http/node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "../http/node-utils/listener-transforms/health-check.js"

export function webSocketServer<ClientFns extends Fns>(
		options: WssOptions<ClientFns>
	) {

	const timeout = options.timeout ?? defaults.timeout
	const maxPayload = options.maxRequestBytes ?? defaults.maxRequestBytes
	const onError = options.tap?.error ?? (() => {})

	const httpServer = http.createServer()
	const wsServer = new ws.WebSocketServer({noServer: true, maxPayload})

	async function acceptConnection(
			socket: ws.WebSocket,
			req: http.IncomingMessage,
		) {

		const ip = ipAddress(req)
		const headers = simplifyHeaders(req.headers)
		const taps = options.tap?.webSocket({ip, headers, req})
		const onClosed = sub<any | void>()

		const conduit = new WebSocketConduit({
			socket,
			timeout,
			onClose: () => onClosed.pub(),
			onError: (error) => {
				taps?.remote?.error(error)
				onClosed.pub()
			},
		})

		const messenger = new Messenger<ClientFns>({
			conduit,
			timeout,
			tap: taps?.remote,
			getLocalEndpoint: (clientside, rig) => endpoint({
				fns: getLocalFns(clientside, rig),
				tap: taps?.local,
			}),
		})

		const {fns: getLocalFns, onDisconnect} = options.accept({
			ip,
			req,
			socket,
			headers,
			clientside: messenger.remote,
			close: () => {
				if (socket.readyState === 1)
					socket.close()
				onClosed.pub()
			},
		})

		onClosed(() => {
			conduit.dispose()
			messenger.dispose()
			onDisconnect()
		})
	}

	return new Promise<Wss>((resolve, reject) => {
		const handleError = (error: Error) => {
			onError(error)
			reject(error)
		}

		wsServer
			.on("error", handleError)
			.on("connection", acceptConnection)

		httpServer
			.on("error", handleError)
			.on("request", allowCors(healthCheck("/health")))
			.on("upgrade", (request, socket, head) => {
				wsServer.handleUpgrade(request, socket, head, ws => {
					wsServer.emit("connection", ws, request)
				})
			})
			.listen(options.port, () => resolve({
				close: () => {
					wsServer.close()
					httpServer.close()
				},
			}))
	})
}

