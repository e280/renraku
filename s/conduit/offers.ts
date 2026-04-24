
import {Portal} from "./portal.js"
import {Fns} from "../parts/types.js"

export function gate(target: Window | WindowProxy, targetOrigin: string) {
	return (event: MessageEvent) => (
		event.source === target &&
		event.origin === targetOrigin
	)
}

export function sendOffer<RemoteFns extends Fns>(options: {
		target: Window | WindowProxy
		targetOrigin: string
		fns?: Fns
		timeout?: number
	}) {
	const {target, targetOrigin, fns, timeout} = options
	const {port1, port2} = new MessageChannel()
	target.postMessage("offer", {targetOrigin, transfer: [port2]})
	return new Portal<RemoteFns>(port1, {fns, timeout})
}

export function sendOfferFromWorker<RemoteFns extends Fns>(options: {
		fns?: Fns,
		timeout?: number,
	} = {}) {
	const {port1, port2} = new MessageChannel()
	self.postMessage("offer", {transfer: [port2]})
	return new Portal<RemoteFns>(port1, options)
}

export function acceptOffers<RemoteFns extends Fns>(options: {
		fns?: Fns
		timeout?: number
		allow: (event: MessageEvent) => boolean
		accept: (portal: Portal<RemoteFns>) => void
	}) {
	const onmessage = (event: MessageEvent) => {
		if (options.allow(event) && event.data === "offer") {
			options.accept(
				new Portal(event.ports[0], {
					fns: options.fns,
					timeout: options.timeout,
				})
			)
		}
	}
	globalThis.addEventListener("message", onmessage)
	return () => globalThis.removeEventListener("message", onmessage)
}

