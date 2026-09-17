
import {got} from "@e280/stz"
import {MessageChannel, parentPort} from "node:worker_threads"
import {offerPort} from "../../core/portal/ports/basics/offer-port.js"

export async function nodeWorkerPortOffer() {
	const parent = got(parentPort)

	return offerPort({
		channel: new MessageChannel(),
		send: (data, transfers) => parent.postMessage(data, transfers),
		recv: fn => {
			parent.on("message", fn)
			return () => parent.off("message", fn)
		},
	})
}

