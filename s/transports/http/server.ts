
import {Server} from "http"
import {defaults} from "../defaults.js"
import {endpoint} from "../../core/endpoint.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Endpoint, Fns, HttpMeta} from "../../core/types.js"
import {allowCors} from "./node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "./node-utils/listener-transforms/health-check.js"
import {EndpointListenerOptions, makeEndpointListener} from "./node-utils/endpoint-listener.js"

export class HttpServer extends Server {
	constructor(
			endpoint: (meta: HttpMeta) => Endpoint,
			options: EndpointListenerOptions = {},
		) {

		super(
			allowCors(
				healthCheck(
					"/health",
					makeEndpointListener(endpoint, options),
				)
			)
		)

		this.timeout = options.timeout ?? defaults.timeout
	}
}

export type HttpServerOptions = {
	port: number
	host?: string
	tap?: LoggerTap
	expose: (meta: HttpMeta) => Fns
}

export async function httpServer({port, host, expose, tap = LoggerTap.dummy()}: HttpServerOptions) {
	const server = new HttpServer(meta => endpoint({
		fns: expose(meta),
		tap: tap.http(meta),
	}))

	return new Promise<HttpServer>((resolve, reject) => {
		server.once("error", reject)
		if (host) server.listen(host, port, () => resolve(server))
		else server.listen(port, () => resolve(server))
	})
}

