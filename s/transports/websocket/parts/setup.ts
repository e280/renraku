
import * as ws from "ws"

import {Fns} from "../../../core/types.js"
import {defaults} from "../../defaults.js"
import {WsSetupOptions} from "../types.js"
import {webSocketConnector} from "./connector.js"
import {Upgrader} from "../../http/node-utils/types.js"

export function webSocketSetup<ClientFns extends Fns>(
		options: WsSetupOptions<ClientFns>
	) {

	const maxPayload = options.maxRequestBytes ?? defaults.maxRequestBytes

	const wsServer = new ws.WebSocketServer({noServer: true, maxPayload})
	wsServer.on("connection", webSocketConnector(options))
	wsServer.on("error", e => options.tap?.error(e))

	const upgrader: Upgrader = (request, socket, head) => {
		wsServer.handleUpgrade(request, socket, head, ws => {
			wsServer.emit("connection", ws, request)
		})
	}

	return {wsServer, upgrader}
}

