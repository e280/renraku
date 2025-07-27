
import {endpoint} from "../../core/endpoint.js"
import {Fns, HttpMeta} from "../../core/types.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {route, router} from "./node-utils/routing.js"
import {respond, responders} from "./node-utils/responding.js"
import {NiceHttpServer} from "./node-utils/nice-http-server.js"
import {CorsConfig, transmuters} from "./node-utils/transmuting.js"
import {makeEndpointListener} from "./node-utils/endpoint-listener.js"

export type HttpServerOptions = {
	tap?: LoggerTap
	timeout?: number
	cors?: CorsConfig
	expose: (meta: HttpMeta) => Fns
}

export async function httpServer(options: HttpServerOptions) {
	const {expose, tap = LoggerTap.dummy()} = options

	const server = new NiceHttpServer({
		timeout: options.timeout,
		transmuters: [transmuters.allowCors(options.cors)],
		listener: router(
			route.get("/health", respond(responders.healthCheck())),
			route.post("/", makeEndpointListener(meta => endpoint({
				fns: expose(meta),
				tap: tap.http(meta),
			}))),
		),
	})

	return server
}

