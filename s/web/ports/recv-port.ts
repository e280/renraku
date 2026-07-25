
import {defer, nap} from "@e280/stz"
import {portOffer, portAccepted} from "./consts.js"
import {defaultTimeout} from "../../core/messenger/consts.js"

export async function recvPort(options: {
		topic: string
		from: Window | WindowProxy
		fromOrigin: string
		timeout?: number
	}) {

	const {topic, from, fromOrigin, timeout = defaultTimeout} = options
	const deferred = defer<{port: MessagePort, origin: string}>()

	if (timeout !== Infinity)
		nap(timeout).then(() => deferred.reject(new Error("timed out")))

	const onmessage = (event: MessageEvent) => {
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
			deferred.resolve({port, origin: event.origin})
		}
	}

	globalThis.addEventListener("message", onmessage)

	return deferred.promise.finally(() => {
		globalThis.removeEventListener("message", onmessage)
	})
}

