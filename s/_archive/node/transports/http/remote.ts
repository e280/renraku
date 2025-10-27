
import {makeRemote} from "../../../universal/core/remote.js"
import {ErrorTap} from "../../../universal/core/taps/error.js"
import {Endpoint, Fns, Tap} from "../../../universal/core/types.js"

export type HttpEndpointOptions = {
	url: string | URL
	tap?: Tap
	headers?: Record<string, string>
}

export function httpRemote<F extends Fns>(options: HttpEndpointOptions) {
	return makeRemote<F>({endpoint: httpEndpoint(options)})
}

export function httpEndpoint({
		url,
		tap = new ErrorTap(),
		headers = {},
	}: HttpEndpointOptions) {

	return (async request => {
		tap.rpcRequest({request, remote: false})

		const response = await fetch(url, {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "omit",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(request),
			headers: {
				...headers,

				// sent as plain text, to avoid cors "options" preflight requests,
				// by qualifying as a cors "simple request"
				"Content-Type": "text/plain; charset=utf-8",
			},
		})

		return response.json()
	}) as Endpoint
}

