
import {defaultTimeout} from "@e280/stz"
import {Fns, Ret} from "../base/types.js"
import {makeRemote} from "../base/remote.js"

export function httpRemote<F extends Fns>(
		url: string,
		options: {timeout?: number} = {},
	) {

	const timeout = options.timeout ?? defaultTimeout

	return makeRemote<F>(async call => {
		const response = await fetch(url, {
			method: "POST",
			headers: {"content-type": "text/plain"},
			body: JSON.stringify(call),
			signal: timeout === Infinity
				? undefined
				: AbortSignal.timeout(timeout),
		})

		if (!response.ok)
			throw new Error(`rpc failed, ${response.status}`)

		return await response.json() as Ret
	})
}

