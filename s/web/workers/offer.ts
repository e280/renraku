
import {offerPort} from "../../core/ports/offer.js"
import {defaultRemoteTimeout} from "../../consts.js"

export async function offerWorkerPort(timeout = defaultRemoteTimeout) {
	return (await offerPort({
		timeout,
		channel: new MessageChannel(),
		send: (data, transfer) => self.postMessage(data, transfer),
		recv: fn => {
			const listener = (event: MessageEvent) => fn(event.data)
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})).port
}

