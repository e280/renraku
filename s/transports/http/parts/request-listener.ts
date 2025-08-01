
import type * as http from "http"

import {Tap} from "../../../core/types.js"
import {readStream} from "./read-stream.js"
import {Rpc} from "../../../server/types.js"
import {defaults} from "../../../defaults.js"
import {JsonRpc} from "../../../core/json-rpc.js"
import {ErrorTap} from "../../../core/taps/error.js"
import {makeEndpoint} from "../../../core/endpoint.js"
import {ipAddress} from "../../../tools/ip-address.js"

export type RequestListenerOptions = {
	rpc: Rpc<any>
	tap?: Tap
	timeout?: number
	maxRequestBytes?: number
}

export function makeRequestListener(options: RequestListenerOptions): http.RequestListener {
	const tap = options.tap ?? new ErrorTap()
	const maxRequestBytes = options.maxRequestBytes ?? defaults.maxRequestBytes

	return async(request, response) => {
		try {
			const body = await readStream(request, maxRequestBytes)
			const requestish = JSON.parse(body) as JsonRpc.Requestish
			const e = makeEndpoint({
				tap,
				fns: await options.rpc({
					request,
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
			await tap.error({error})
		}
	}
}

