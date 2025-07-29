
import * as ws from "ws"

import {Fns} from "../../../core/types.js"
import {defaults} from "../../../defaults.js"
import {WsIntegrationOptions} from "../types.js"
import {wsConnector} from "./connector.js"
import {Upgrader} from "../../http/types.js"

export class WsIntegration<ClientFns extends Fns> {
	wss: ws.WebSocketServer
	error: Error | undefined

	constructor(options: WsIntegrationOptions<ClientFns>) {
		const maxPayload = options.maxRequestBytes ?? defaults.maxRequestBytes
		this.wss = new ws.WebSocketServer({noServer: true, maxPayload})
		this.wss.on("connection", wsConnector(options))
		this.wss.on("error", e => {
			this.error = e
		})
	}

	upgrader: Upgrader = (request, socket, head) => {
		this.wss.handleUpgrade(request, socket, head, ws => {
			this.wss.emit("connection", ws, request)
		})
	}

	close() {
		this.wss.close()
	}
}

