
import {remote} from "../../core/remote.js"
import {defaultTap} from "../../core/taps/default.js"
import {Endpoint, Fns, Tap} from "../../core/types.js"

export type HttpEndpointOptions = {
	url: string | URL
	tap?: Tap
}

export function httpRemote<F extends Fns>(options: HttpEndpointOptions) {
	return remote<F>({endpoint: httpEndpoint(options)})
}

export function httpEndpoint({url, tap = defaultTap}: HttpEndpointOptions): Endpoint {
	return async request => {
		tap.request({request})

		const response = await fetch(url, {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "omit",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(request),
			headers: {

				// sent as plain text, to avoid cors "options" preflight requests,
				// by qualifying as a cors "simple request"
				"Content-Type": "text/plain; charset=utf-8",
			},
		})

		return response.json()
	}
}

