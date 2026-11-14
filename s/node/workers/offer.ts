
import {got} from "@e280/stz"
import {MessageChannel, parentPort} from "node:worker_threads"
import {defaultPortTimeout} from "../../consts.js"
import {offerPort} from "../../core/ports/offer.js"

export async function nodeOfferWorkerPort(timeout = defaultPortTimeout) {
	const parent = got(parentPort)

	const {port} = await offerPort({
		timeout,
		channel: new MessageChannel(),
		send: (data, transfers) => parent.postMessage(data, transfers),
		recv: fn => {
			parent.on("message", fn)
			return () => parent.off("message", fn)
		},
	})

	return port
}

