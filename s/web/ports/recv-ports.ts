
import {ev} from "@e280/stz"
import {portAccepted, portOffer} from "./consts.js"

export function recvPorts({topic, from, fromOrigin, onPort}: {
		topic: string
		from: Window | WindowProxy
		fromOrigin: string
		onPort: (port: MessagePort) => void
	}) {

	return ev(globalThis, {message: (event: MessageEvent) => {
		if (
			event.source === from &&
			event.origin === fromOrigin &&
			event.data?.kind === portOffer &&
			event.data.topic === topic
		) {
			const [port] = event.ports
			const id = event.data?.id
			from.postMessage(
				{kind: portAccepted, topic, id},
				{targetOrigin: fromOrigin},
			)
			onPort(port)
		}
	}})
}

