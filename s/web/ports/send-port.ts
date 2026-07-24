
import {defer, nap} from "@e280/stz"
import {portOffer, portAccepted} from "./consts.js"
import {randomId} from "../../core/utils/random-id.js"
import {defaultTimeout} from "../../core/messenger/consts.js"

export async function sendPort(options: {
		topic: string
		to: Window | WindowProxy
		toOrigin?: string
		timeout?: number
	}) {

	const {topic, to, toOrigin = "*", timeout = defaultTimeout} = options
	const deferred = defer<{port: MessagePort, origin: string}>()
	const {port1, port2} = new MessageChannel()
	const id = randomId()

	if (timeout !== Infinity)
		nap(timeout).then(() => deferred.reject(new Error("timed out")))

	const onmessage = (event: MessageEvent) => {
		if (
			event.source === to &&
			event.data?.kind === portAccepted &&
			event.data?.topic === topic &&
			event.data?.id === id
		) deferred.resolve({port: port1, origin: event.origin})
	}

	globalThis.addEventListener("message", onmessage)

	to.postMessage(
		{kind: portOffer, topic, id},
		{targetOrigin: toOrigin, transfer: [port2]},
	)

	return deferred.promise
		.finally(() => globalThis.removeEventListener("message", onmessage))
}

