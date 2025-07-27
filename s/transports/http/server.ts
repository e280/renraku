
import * as http from "node:http"

import {defaults} from "../defaults.js"
import {endpoint} from "../../core/endpoint.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Endpoint, Fns, HttpMeta} from "../../core/types.js"
import {allowCors} from "./node-utils/listener-transforms/allow-cors.js"
import {healthCheck} from "./node-utils/listener-transforms/health-check.js"
import {EndpointListenerOptions, makeEndpointListener} from "./node-utils/endpoint-listener.js"
import {NiceServer} from "./node-utils/nice-server.js"
import {Pipe} from "@e280/stz"
import {listeners, route, router, transmute, transmuters} from "./node-utils/transmuters.js"

// export class HttpServer {
// 	nodeServer: http.Server
//
// 	constructor(
// 			endpoint: (meta: HttpMeta) => Endpoint,
// 			options: EndpointListenerOptions = {},
// 		) {
// 		const fn = makeEndpointListener(endpoint, options)
// 		const listener = allowCors(healthCheck("/health", fn))
// 		this.nodeServer = new http.Server(listener)
// 		this.nodeServer.timeout = options.timeout ?? defaults.timeout
// 	}
//
// 	async listen({port, host}: {port: number, host?: string}) {
// 		return new Promise<HttpServer>((resolve, reject) => {
// 			this.nodeServer.once("error", reject)
// 			if (host) this.nodeServer.listen(host, port, () => resolve(this))
// 			else this.nodeServer.listen(port, () => resolve(this))
// 		})
// 	}
// }

export type HttpServerOptions = {
	port: number
	host?: string
	tap?: LoggerTap
	timeout?: number
	expose: (meta: HttpMeta) => Fns
}

export async function httpServer(options: HttpServerOptions) {
	const {port, host, expose, tap = LoggerTap.dummy()} = options

	const server = new NiceServer({
		timeout: options.timeout,
		fn: transmute(
			router(
				route.get("/health", listeners.healthCheck),
				route.post("/", makeEndpointListener(meta => endpoint({
					fns: expose(meta),
					tap: tap.http(meta),
				}))),
			),
			transmuters.allowCors(),
		),
	})

	return server.listen({port, host})
}

