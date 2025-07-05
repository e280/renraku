
import {Tap} from "../core/types.js"
import {JsonRpc} from "./json-rpc.js"
import {ExposedError} from "../core/errors.js"

export async function respond<R>({
		tap,
		request,
		action,
	}: {
		tap: Tap
		request: JsonRpc.Request
		action: () => Promise<R>
	}): Promise<JsonRpc.Response<R> | null> {

	const id = JsonRpc.getId(request)

	try {
		const result = await action()

		if (id === null)
			return null

		return {
			id,
			result,
			jsonrpc: JsonRpc.version,
		}
	}

	catch (error) {
		tap.rpcError({request, error})

		if (id === null)
			return null

		return {
			id,
			jsonrpc: JsonRpc.version,
			error: (error instanceof ExposedError)
				? {
					code: JsonRpc.errorCodes.serverError,
					message: error.message,
				}
				: {
					code: JsonRpc.errorCodes.unexposedError,
					message: `unexposed error`,
				},
		}
	}
}

