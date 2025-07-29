
import {drill} from "@e280/stz"
import {execute} from "./execute.js"
import {defaults} from "../defaults.js"
import {Endpoint, Fn, Fns, Tap} from "./types.js"

export type EndpointOptions<F extends Fns> = {
	fns: F
	tap?: Tap
}

/**
 * Create a renraku endpoint for your fns.
 *  - an endpoint is a function that accepts json rpc requests
 *  - for each request, it calls the appropriate fn
 *  - it then returns the fn's in json rpc response format
 */
export function makeEndpoint<F extends Fns>({fns, tap = defaults.tap}: EndpointOptions<F>): Endpoint {
	return async request => {
		const path = request.method.split(".")
		const fn = drill(fns, path) as Fn
		const action = async() => await fn(...request.params)

		tap.request({request})

		const response = await execute({
			tap,
			request,
			action,
		})

		return response
	}
}

