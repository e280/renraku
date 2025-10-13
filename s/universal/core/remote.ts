
import {JsonRpc} from "./json-rpc.js"
import {RemoteError} from "./errors.js"
import {ErrorTap} from "./taps/error.js"
import {remoteProxy} from "./remote-proxy.js"
import {Endpoint, Fns, Tap} from "./types.js"

export type RemoteOptions = {
	endpoint: Endpoint
	label?: string
	notify?: boolean
	tap?: Tap
}

/**
 * Create a renraku remote for the given endpoint.
 *  - the remote uses js proxies to mirror the shape of your fns object
 *  - so when you make async calls on the remote, it will convert those into json rpc requests that are actuated on the given endpoint
 *  - the endpoint you provide could be making network calls, or doing something else, the remote doesn't care how the endpoint is implemented
 */
export function makeRemote<F extends Fns>(options: RemoteOptions) {
	const {endpoint, tap = new ErrorTap()} = options
	let id = 1

	return remoteProxy<F>(async(
			path,
			params,
			settings,
		) => {

		const notify = settings.notify ?? options.notify ?? false
		const transfer = settings.transfer

		const base: JsonRpc.Notification<any[]> = {
			jsonrpc: "2.0" as const,
			method: path.join("."),
			params,
		}

		const request: JsonRpc.Request = (
			notify
				? base
				: {...base, id: id++}
		)

		tap.rpcRequest({request})

		const response = await endpoint(request, {transfer})

		if (notify && !response)
			return null

		if (!response)
			throw new RemoteError("response was null, but shouldn't be, because the request was not a notification")

		if ("error" in response)
			throw new RemoteError(
				options.label
					? `${options.label}: ${response.error.message}`
					: response.error.message
			)

		return response.result
	})
}

