
import {offerPort} from "../../core/portal/ports/basics/offer.js"

export async function offerWorkerPort() {
	return offerPort({
		channel: new MessageChannel(),
		send: (data, transfer) => self.postMessage(data, transfer),
		recv: fn => {
			const listener = (event: MessageEvent) => fn(event.data)
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})
}

