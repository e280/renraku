
import {Offer} from "../../core/portal/ports/types.js"
import {allowgate, goodTopic, Topical} from "./utils.js"
import {offerPort} from "../../core/portal/ports/basics/offer-port.js"

export async function webPortOffer(options: {
		topic: string
		to: Window | WindowProxy
		origin?: string
		allow?: (event: MessageEvent) => boolean
	}) {

	const {topic, to, allow = () => true, origin = "*"} = options
	const gate = allowgate(to, origin, allow)

	return offerPort({
		channel: new MessageChannel(),

		send: (offer, transfer) => {
			const msg: Topical<Offer> = {topic, payload: offer}
			to.postMessage(msg, origin, transfer)
		},

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (goodTopic(event.data, topic) && gate(event))
					fn(event.data.payload)
			}
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})
}

