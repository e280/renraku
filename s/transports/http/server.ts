
import {Upgrader} from "./node-utils/types.js"
import {endpoint} from "../../core/endpoint.js"
import {Fns, HttpMeta} from "../../core/types.js"
import {respond} from "./node-utils/responding.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {route, router} from "./node-utils/routing.js"
import {NiceHttpServer} from "./node-utils/nice-http-server.js"
import {CorsConfig, transmuters} from "./node-utils/transmuting.js"
import {makeEndpointListener} from "./node-utils/endpoint-listener.js"

export type HttpServerOptions = {
	expose: (meta: HttpMeta) => Fns
	tap?: LoggerTap
	timeout?: number
	cors?: CorsConfig
	maxRequestBytes?: number
	upgrader?: Upgrader
}

export class HttpServer extends NiceHttpServer {
	constructor({
			cors,
			timeout,
			maxRequestBytes,
			tap = LoggerTap.dummy(),
			expose,
			upgrader,
		}: HttpServerOptions) {

		const endpointListener = makeEndpointListener(
			meta => endpoint({
				fns: expose(meta),
				tap: tap.http(meta),
			}),
			{maxRequestBytes, timeout, responders: tap},
		)

		super({
			upgrader,
			timeout,
			transmuters: [transmuters.allowCors(cors)],
			listener: router(
				route.get("/health", respond.health()),
				route.post("/", endpointListener),
			),
		})
	}
}

