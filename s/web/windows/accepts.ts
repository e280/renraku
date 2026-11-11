
import {check} from "./utils.js"
import {Port} from "../../core/portal/types.js"
import {Accept} from "../../core/portal/ports/types.js"
import {Topical, WindowAcceptOptions} from "./types.js"
import {acceptPorts} from "../../core/portal/ports/basics/accepts.js"

export function acceptWindowPorts(options: WindowAcceptOptions & {
		onPort: (port: Port, event: MessageEvent) => void
	}) {

	const {topic, from, origin, onPort, allow = () => true} = options

	return acceptPorts({
		onPort,

		send: (accept, transfer) => {
			const msg: Topical<Accept> = {topic, payload: accept}
			from.postMessage(msg, origin, transfer)
		},

		recv: fn => {
			const listener = (event: MessageEvent) => {
				if (check({event, topic, origin, source: from}) && allow(event))
					fn(event.data.payload, event)
			}
			globalThis.addEventListener("message", listener)
			return () => globalThis.removeEventListener("message", listener)
		},
	})
}

