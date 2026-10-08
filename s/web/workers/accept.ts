
import {acceptPort} from "../../core/portal/ports/basics/accept.js"

export async function acceptWorkerPort(worker: Worker) {
	return acceptPort({
		send: (data, transfer) => worker.postMessage(data, transfer),
		recv: fn => {
			const listener = (event: MessageEvent) => fn(event.data)
			worker.addEventListener("message", listener)
			return () => worker.removeEventListener("message", listener)
		},
	})
}

