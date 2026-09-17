
import {Worker} from "node:worker_threads"
import {acceptPort} from "../../core/portal/ports/basics/accept-port.js"

export function nodeWorkerPortAccept(worker: Worker) {
	return acceptPort({
		send: (data, transfer) => worker.postMessage(data, transfer),
		recv: fn => {
			worker.on("message", fn)
			return () => worker.off("message", fn)
		},
	})
}

