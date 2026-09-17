
import {Port} from "../../core/portal/types.js"
import {Accept} from "../../core/portal/ports/types.js"
import {acceptPorts} from "../../core/portal/ports/basics/accept-ports.js"
import {allowgate, goodTopic, Topical, WebAcceptOptions} from "./utils.js"

export function webPortAccepts(options: WebAcceptOptions & {
		onPort: (port: Port, origin: string) => void
	}) {

	const {topic, from, onPort, origin, allow = () => true} = options
	const gate = allowgate(from, origin, allow)

	return acceptPorts({
		onPort,

		send: (accept, transfer) => {
			const msg: Topical<Accept> = {topic, payload: accept}
			from.postMessage(msg, origin, transfer)
		},

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (goodTopic(event.data, topic) && gate(event))
					fn(event.data.payload, event.origin)
			}
			globalThis.addEventListener("message", listener)
			return () => globalThis.removeEventListener("message", listener)
		},
	})
}

