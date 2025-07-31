
import {ServerOptions} from "./types.js"
import {LoggerTap} from "../core/taps/logger.js"
import {HttpServer} from "../transports/http/http-server.js"
import {respond} from "../transports/http/parts/responding.js"
import {route, router} from "../transports/http/parts/routing.js"
import {transmuters} from "../transports/http/parts/transmuting.js"
import {WsIntegration} from "../transports/websocket/integration.js"
import {makeRequestListener} from "../transports/http/parts/request-listener.js"

export class Server extends HttpServer {
	#ws: WsIntegration<any> | undefined

	constructor(options: ServerOptions) {
		const tap = options.tap ?? new LoggerTap()
		const rpcListener = makeRequestListener({
			...options,
			tap,
			rpc: options.rpc ?? (async() => ({})),
		})

		super({
			...options,
			transmuters: [
				...(options.cors ? [transmuters.allowCors(options.cors)] : []),
				...(options.transmuters ?? [])
			],
			listener: router(
				route.get(options.healthRoute ?? "/health", respond.health()),
				route.post(options.rpcRoute ?? "/", rpcListener),
				...(options.routes ?? []),
			),
		})

		if (options.websocket) {
			this.#ws = new WsIntegration({...options, tap, accepter: options.websocket})
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

