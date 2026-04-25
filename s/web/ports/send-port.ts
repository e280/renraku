
import {defer, nap} from "@e280/stz"
import {gatekeep} from "./gatekeep.js"
import {portOffer, portAccepted} from "./consts.js"
import {randomId} from "../../core/utils/random-id.js"
import {defaultTimeout} from "../../core/messenger/consts.js"

export async function sendPort(options: {
		topic: string
		to: Window | WindowProxy
		toOrigin: string
		timeout?: number
	}) {

	const {topic, to, toOrigin, timeout = defaultTimeout} = options
	const {port1, port2} = new MessageChannel()
	const id = randomId()

	to.postMessage(
		{kind: portOffer, topic, id},
		{targetOrigin: toOrigin, transfer: [port2]},
	)

	const deferred = defer<MessagePort>()
	const allow = gatekeep(to, toOrigin)

	nap(timeout)
		.then(() => deferred.reject(new Error("timed out")))

	const onmessage = (event: MessageEvent) => {
		if (
			allow(event) &&
			event.data?.kind === portAccepted &&
			event.data?.topic === topic &&
			event.data?.id === id
		) deferred.resolve(port1)
	}

	globalThis.addEventListener("message", onmessage)

	return deferred.promise
		.finally(() => globalThis.removeEventListener("message", onmessage))
}

