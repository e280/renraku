
import {ServerOptions} from "./types.js"
import {websocket} from "../transports/websocket/types.js"
import {HttpServer} from "../transports/http/http-server.js"
import {respond} from "../transports/http/parts/responding.js"
import {route, router} from "../transports/http/parts/routing.js"
import {transmuters} from "../transports/http/parts/transmuting.js"
import {WsIntegration} from "../transports/websocket/parts/integration.js"
import {makeEndpointListener} from "../transports/http/parts/endpoint-listener.js"

export class Server extends HttpServer {
	static websocket = websocket
	#ws: WsIntegration<any> | undefined

	constructor(options: ServerOptions) {
		const rpc = makeEndpointListener({
			...options,
			rpc: options.rpc ?? (() => ({})),
		})
		super({
			...options,
			transmuters: [
				...(options.cors ? [transmuters.allowCors(options.cors)] : []),
				...(options.transmuters ?? [])
			],
			listener: router(
				route.get(options.healthRoute ?? "/health", respond.health()),
				route.post(options.rpcRoute ?? "/", rpc),
				...(options.routes ?? []),
			),
		})

		if (options.websocket) {
			this.#ws = new WsIntegration({...options, accept: options.websocket})
			this.stock.on("upgrade", this.#ws.upgrader)
		}
	}

	async listen(port: number, host?: string) {
		await super.listen(port, host)

		const error = this.#ws?.error
		if (error) throw error
	}

	close() {
		super.close()
		this.#ws?.close()
	}
}

