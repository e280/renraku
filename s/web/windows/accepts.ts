
import {Port} from "../../core/portal/types.js"
import {Accept} from "../../core/portal/ports/types.js"
import {assert, goodTopic, Topical, WebAcceptOptions} from "./utils.js"
import {acceptPorts} from "../../core/portal/ports/basics/accept-ports.js"

export function webPortAccepts(options: WebAcceptOptions & {
		onPort: (port: Port) => void
	}) {

	const {topic, from, onPort, origin, allow = () => true} = options

	const allow2 = (event: MessageEvent) => (
		assert(event.source === from, "bad message source") &&
		assert(event.origin === origin, "bad message origin") &&
		assert(allow(event), "not allowed")
	)

	return acceptPorts({
		onPort,

		send: (accept, transfer) => {
			const msg: Topical<Accept> = {topic, payload: accept}
			from.postMessage(msg, origin, transfer)
		},

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (goodTopic(event.data, topic) && allow2(event))
					fn(event.data.payload)
			}
			globalThis.addEventListener("message", listener)
			return () => globalThis.removeEventListener("message", listener)
		},
	})
}

