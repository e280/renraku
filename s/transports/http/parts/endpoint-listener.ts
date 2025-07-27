
import type * as http from "http"

import {defaults} from "../../defaults.js"
import {readStream} from "./read-stream.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {endpoint} from "../../../core/endpoint.js"
import {HttpMeta, Fns} from "../../../core/types.js"
import {LoggerTap} from "../../../core/taps/logger.js"
import {ipAddress} from "../../../tools/ip-address.js"

export type EndpointListenerOptions = {
	rpc: (meta: HttpMeta) => Fns
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
}

export function makeEndpointListener(options: EndpointListenerOptions): http.RequestListener {
	return async(request, response) => {
		try {
			const {maxRequestBytes = defaults.maxRequestBytes} = options
			const body = await readStream(request, maxRequestBytes)
			const requestish = JSON.parse(body) as JsonRpc.Requestish
			const e = endpoint({
				tap: options.tap,
				fns: options.rpc({
					request: request,
					ip: ipAddress(request),
				}),
			})

			const send = (respondish: null | JsonRpc.Respondish) => {
				response.statusCode = 200
				response.setHeader("Content-Type", "application/json")
				response.end(JSON.stringify(respondish))
			}

			if (Array.isArray(requestish)) {
				const responses = (await Promise.all(requestish.map(x => e(x))))
					.filter(r => !!r)
				send(
					(responses.length > 0)
						? responses
						: null
				)
			}
			else
				send(await e(requestish))
		}
		catch (error) {
			response.statusCode = 500
			response.end()
			options.tap?.error(error)
		}
	}
}

