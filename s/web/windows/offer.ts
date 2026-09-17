
import {assert, goodTopic, Topical} from "./utils.js"
import {Offer} from "../../core/portal/ports/types.js"
import {offerPort} from "../../core/portal/ports/basics/offer-port.js"

export async function webPortOffer(options: {
		topic: string
		to: Window | WindowProxy
		origin?: string
		allow?: (event: MessageEvent) => boolean
	}) {

	const {topic, to, allow = () => true, origin = "*"} = options

	const allow2 = (event: MessageEvent) => (
		assert(event.source === to, "bad message source") &&
		assert(origin === "*" || event.origin === origin, "bad message origin") &&
		assert(allow(event), "not allowed")
	)

	return offerPort({
		channel: new MessageChannel(),

		send: (offer, transfer) => {
			const msg: Topical<Offer> = {topic, payload: offer}
			to.postMessage(msg, origin, transfer)
		},

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (goodTopic(event.data, topic) && allow2(event))
					fn(event.data.payload)
			}
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})
}

