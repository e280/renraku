
import {offerPort} from "../../core/portal/ports/basics/offer-port.js"

export async function webWorkerPortOffer() {
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

