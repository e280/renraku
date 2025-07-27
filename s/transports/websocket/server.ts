
import * as ws from "ws"

import {Fns} from "../../core/types.js"
import {HttpServer} from "../http/server.js"
import {webSocketSetup} from "./parts/setup.js"
import {WebSocketServerOptions} from "./types.js"
import {ListenHttpOptions} from "../http/node-utils/types.js"

export class WebSocketServer<ClientFns extends Fns> {
	ws: ws.WebSocketServer
	http: HttpServer

	constructor(private options: WebSocketServerOptions<ClientFns>) {
		const {wsServer, upgrader} = webSocketSetup(options)
		this.ws = wsServer
		this.http = new HttpServer({
			...options,
			upgrader,
			expose: options.expose ?? (() => ({})),
		})
	}

	async listen(options: ListenHttpOptions) {
		let wsError: any
		this.ws.on("error", error => { wsError = error })
		await this.http.listen(options)
		if (wsError) {
			this.options.tap?.error(wsError)
			throw wsError
		}
	}

	close() {
		return this.http.close()
	}
}

