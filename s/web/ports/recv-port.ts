
import {defer, nap} from "@e280/stz"
import {gatekeep} from "./gatekeep.js"
import {portOffer, portAccepted} from "./consts.js"
import {defaultTimeout} from "../../core/messenger/consts.js"

export async function recvPort(options: {
		topic: string
		from: Window | WindowProxy
		fromOrigin: string
		timeout?: number
	}) {

	const {topic, from, fromOrigin, timeout = defaultTimeout} = options
	const deferred = defer<MessagePort>()
	const allow = gatekeep(from, fromOrigin)

	nap(timeout)
		.then(() => deferred.reject(new Error("timed out")))

	const onmessage = (event: MessageEvent) => {
		if (
			allow(event) &&
			event.data?.kind === portOffer &&
			event.data.topic === topic
		) {
			const [port] = event.ports
			const id = event.data?.id
			from.postMessage(
				{kind: portAccepted, topic, id},
				{targetOrigin: fromOrigin},
			)
			deferred.resolve(port)
		}
	}

	globalThis.addEventListener("message", onmessage)

	return deferred.promise.finally(() => {
		globalThis.removeEventListener("message", onmessage)
	})
}

