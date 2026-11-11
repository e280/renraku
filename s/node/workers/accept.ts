
import {Worker} from "node:worker_threads"
import {acceptPort} from "../../core/ports/accept.js"

export function nodeAcceptWorkerPort(worker: Worker) {
	return acceptPort({
		send: (data, transfer) => worker.postMessage(data, transfer),
		recv: fn => {
			worker.on("message", fn)
			return () => worker.off("message", fn)
		},
	})
}

