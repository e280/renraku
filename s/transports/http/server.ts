
import {Fns} from "../../core/types.js"
import {HttpServerOptions} from "./types.js"
import {respond} from "./node-utils/responding.js"
import {route, router} from "./node-utils/routing.js"
import {NiceServer} from "./node-utils/nice-server.js"
import {transmuters} from "./node-utils/transmuting.js"
import {ListenHttpOptions} from "./node-utils/types.js"
import {WsIntegrationOptions} from "../websocket/types.js"
import {WsIntegration} from "../websocket/parts/integration.js"
import {makeEndpointListener} from "./node-utils/endpoint-listener.js"

export class HttpServer extends NiceServer {
	#ws: WsIntegration<any> | undefined

	constructor(options: HttpServerOptions) {
		super({
			...options,
			transmuters: [transmuters.allowCors(options.cors)],
			listener: router(
				route.get("/health", respond.health()),
				route.post("/", makeEndpointListener(options)),
			),
		})
	}

	webSockets<ClientFns extends Fns>(options: WsIntegrationOptions<ClientFns>) {
		if (this.#ws) throw new Error("cannot integration websockets twice")
		const integration = new WsIntegration(options)
		this.stock.on("upgrade", integration.upgrader)
		this.#ws = integration
	}

	async listen(options: ListenHttpOptions) {
		await super.listen(options)

		const error = this.#ws?.error
		if (error) throw error
	}

	close() {
		super.close()
		this.#ws?.close()
	}
}

