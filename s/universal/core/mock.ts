
import {Fns} from "./types.js"
import {makeRemote} from "./remote.js"
import {Remote} from "./remote-proxy.js"
import {makeEndpoint, EndpointOptions} from "./endpoint.js"

/**
 * Wrap your fns in an endpoint and remote.
 *  - this gives you a real renraku remote where you can use the `tune` symbol and such
 *  - this is useful for when you have special logic that relies on that special renraku functionality
 */
export function makeMock<F extends Fns>(options: EndpointOptions<F>): Remote<F> {
	return makeRemote<F>({endpoint: makeEndpoint(options), tap: options.tap})
}

