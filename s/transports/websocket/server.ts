
import * as ws from "ws"
import {sub} from "@e280/stz"
import * as http from "node:http"

import {Fns} from "../../core/types.js"
import {defaults} from "../defaults.js"
import {endpoint} from "../../core/endpoint.js"
import {Messenger} from "../messenger/messenger.js"
import {ipAddress} from "../../tools/ip-address.js"
import {Upgrader, Wss, WssOptions} from "./types.js"
import {WebSocketConduit} from "../messenger/index.js"
import {route, router} from "../http/node-utils/routing.js"
import {simplifyHeaders} from "../../tools/simple-headers.js"
import {transmuters} from "../http/node-utils/transmuting.js"
import {respond, responders} from "../http/node-utils/responding.js"
import {NiceHttpServer} from "../http/node-utils/nice-http-server.js"

export async function webSocketServer<ClientFns extends Fns>(
		options: WssOptions<ClientFns>
	) {

	const onError = options.tap?.error ?? (() => {})
	const {wsServer, upgrade} = await webSocketUpgrader(options)

	return new Promise<Wss>((resolve, reject) => {
		const handleError = (error: Error) => {
			onError(error)
			reject(error)
		}

		wsServer.on("error", handleError)

		const niceServer = new NiceHttpServer({
			timeout: options.timeout,
			transmuters: [transmuters.allowCors(options.cors)],
			listener: router(
				route.get("/health", respond(responders.healthCheck())),
			),
		})

		niceServer.stock.on("upgrade", upgrade)

		niceServer.listen(options)
			.then(() => resolve({
				wsServer,
				niceServer,
			}))
			.catch(reject)
	})
}

export async function webSocketUpgrader<ClientFns extends Fns>(
		options: WssOptions<ClientFns>
	) {

	const timeout = options.timeout ?? defaults.timeout
	const maxPayload = options.maxRequestBytes ?? defaults.maxRequestBytes

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
			onError: error => {
				taps?.remote?.error(error)
				onClosed.pub()
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

		const {expose, onDisconnect} = options.accept({
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

	const wsServer = new ws.WebSocketServer({noServer: true, maxPayload})
		.on("connection", acceptConnection)

	const upgrade: Upgrader = (request, socket, head) => {
		wsServer.handleUpgrade(request, socket, head, ws => {
			wsServer.emit("connection", ws, request)
		})
	}

	return {
		wsServer,
		upgrade,
	}
}

