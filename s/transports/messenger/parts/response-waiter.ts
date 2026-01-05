
import {deadline, DeadlineError, defer, Deferred} from "@e280/stz"

import {JsonRpc} from "../../../core/json-rpc.js"
import {RemoteError} from "../../../core/errors.js"

type Pend = {
	method: string
	deferred: Deferred<JsonRpc.Response>
}

export class ResponseWaiter {
	pending = new Map<JsonRpc.Id, Pend>()

	constructor(public timeout: number) {}

	async wait(id: JsonRpc.Id, method: string) {
		const deferred = defer<JsonRpc.Response>()
		this.pending.set(id, {method, deferred})
		return await deadline(this.timeout, () => deferred.promise)
			.catch(error => {
				this.pending.delete(id)
				if (error instanceof DeadlineError)
					error.message = `request #${id} ${method}(), ${error.message}`
				throw error
			})
			.finally(() => this.pending.delete(id))
	}

	deliverResponse(response: JsonRpc.Response) {
		const pend = this.pending.get(response.id)
		if (pend) {
			if ("error" in response)
				pend.deferred.reject(new RemoteError(response.error.message))
			else
				pend.deferred.resolve(response)
		}
	}
}

