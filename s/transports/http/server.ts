
import {endpoint} from "../../core/endpoint.js"
import {Fns, HttpMeta} from "../../core/types.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {NiceHttpServer} from "./node-utils/nice-http-server.js"
import {makeEndpointListener} from "./node-utils/endpoint-listener.js"
import {CorsConfig, respond, responders, route, router, transmuters} from "./node-utils/http-kit.js"

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

