
import {check} from "./utils.js"
import {PortResult, Topical} from "./types.js"
import {Offer} from "../../core/ports/types.js"
import {offerPort} from "../../core/ports/offer.js"

export async function offerWindowPort(options: {
		topic: string
		to: Window | WindowProxy
		origin: string
		allow?: (event: MessageEvent) => boolean
	}): Promise<PortResult> {

	const {topic, to, origin, allow = () => true} = options

	const {port, meta} = await offerPort<MessageEvent>({
		channel: new MessageChannel(),

		send: (offer, transfer) => to.postMessage(
			<Topical<Offer>>{topic, payload: offer},
			origin,
			transfer,
		),

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (check({event, topic, origin, source: to}) && allow(event))
					fn(event.data.payload, event)
			}
			self.addEventListener("message", listener)
			return () => self.removeEventListener("message", listener)
		},
	})

	return {port, event: meta}
}

