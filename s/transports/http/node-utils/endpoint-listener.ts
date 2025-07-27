
import type * as http from "http"

import {defaults} from "../../defaults.js"
import {readStream} from "./read-stream.js"
import {JsonRpc} from "../../../comms/json-rpc.js"
import {ipAddress} from "../../../tools/ip-address.js"
import {simplifyHeaders} from "../../../tools/simple-headers.js"
import {Endpoint, Tap, HttpMeta} from "../../../core/types.js"

export type EndpointListenerOptions = {
	timeout?: number
	maxRequestBytes?: number
	responders?: Pick<Tap, "error">
}

export function makeEndpointListener(
		makeEndpoint: (meta: HttpMeta) => Endpoint,
		options: EndpointListenerOptions = {},
	): http.RequestListener {

	const {
		responders,
		maxRequestBytes = defaults.maxRequestBytes,
	} = options

	return async(request, response) => {
		try {
			const body = await readStream(request, maxRequestBytes)
			const requestish = JSON.parse(body) as JsonRpc.Requestish
			const endpoint = makeEndpoint({
				request: request,
				ip: ipAddress(request),
				headers: simplifyHeaders(request.headers),
			})

			const send = (respondish: null | JsonRpc.Respondish) => {
				response.statusCode = 200
				response.setHeader("Content-Type", "application/json")
				response.end(JSON.stringify(respondish))
			}

			if (Array.isArray(requestish)) {
				const responses = (await Promise.all(requestish.map(x => endpoint(x))))
					.filter(r => !!r)
				send(
					(responses.length > 0)
						? responses
						: null
				)
			}
			else
				send(await endpoint(requestish))
		}
		catch (error) {
			response.statusCode = 500
			response.end()
			if (responders)
				responders.error(error)
		}
	}
}

