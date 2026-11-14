
import {Worker} from "node:worker_threads"
import {defaultLocalTimeout} from "../../consts.js"
import {acceptPort} from "../../core/ports/accept.js"

export async function nodeAcceptWorkerPort(
		worker: Worker,
		timeout = defaultLocalTimeout,
	) {

	return acceptPort({
		timeout,
		send: (data, transfer) => worker.postMessage(data, transfer),
		recv: fn => {
			worker.on("message", fn)
			return () => worker.off("message", fn)
		},
	})
}

