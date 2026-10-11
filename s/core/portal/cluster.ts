
import {defer, Deferred} from "@e280/stz"
import {makeRemote} from "../base/remote.js"
import {Endpoint, Fns} from "../base/types.js"

export function cluster<R extends Fns>(endpoints: Endpoint[]) {
	if (!endpoints.length)
		throw new Error("cluster needs endpoints")

	const free = new Set(endpoints)
	const waiting = new Set<Deferred<Endpoint>>()

	function freeOrPassToWaiting(endpoint: Endpoint) {
		const wait = waiting.values().next().value
		if (wait) {
			waiting.delete(wait)
			wait.resolve(endpoint)
		}
		else free.add(endpoint)
	}

	return makeRemote<R>(async call => {
		let endpoint = free.values().next().value

		if (endpoint) free.delete(endpoint)
		else {
			const wait = defer<Endpoint>()
			waiting.add(wait)
			endpoint = await wait
		}

		try { return await endpoint(call) }
		finally { freeOrPassToWaiting(endpoint) }
	})
}

