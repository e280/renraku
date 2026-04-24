
import {RemoteError} from "./errors.js"
import {Endpoint, Fns, Remote} from "./types.js"

export function makeRemote<F extends Fns>(endpoint: Endpoint) {
	function makeProxy(endpoint: Endpoint, path: string[]) {
		return new Proxy(() => {}, {
			get(_target, key) {
				if (typeof key !== "string")
					return undefined
				return makeProxy(endpoint, [...path, key])
			},

			async apply(_target, _thisArg, params) {
				const result = await endpoint([path, ...params])
				if (!result.ok)
					throw new RemoteError(result.error)
				return result.value
			},
		})
	}

	return makeProxy(endpoint, []) as any as Remote<F>
}

