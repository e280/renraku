
import {offerPort} from "../../core/portal/ports/basics/offer.js"

export async function offerWorkerPort() {
	const {port} = await offerPort({
		channel: new MessageChannel(),
		send: (data, transfer) => self.postMessage(data, transfer),
		recv: fn => {
			const listener = (event: MessageEvent) => fn(event.data)
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})
	return port
}

