
import {acceptPort} from "../../core/ports/accept.js"

export async function acceptWorkerPort(worker: Worker, timeout?: number) {
	return acceptPort({
		timeout,
		send: (data, transfer) => worker.postMessage(data, transfer),
		recv: fn => {
			const listener = (event: MessageEvent) => fn(event.data)
			worker.addEventListener("message", listener)
			return () => worker.removeEventListener("message", listener)
		},
	})
}

