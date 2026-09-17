
import {hex} from "@e280/stz"
import {isAccept} from "../utils/is.js"
import {offerKind} from "../utils/kinds.js"
import {Channel, Port} from "../../types.js"
import {Offer, Recv, Send} from "../types.js"

export async function offerPort({send, recv, channel}: {
		send: Send<Offer>
		recv: Recv
		channel: Channel
	}) {

	const id = hex.random()
	const {port1, port2} = channel

	return new Promise<Port>(resolve => {
		const stop = recv(data => {
			if (isAccept(data, id)) {
				stop()
				resolve(port1)
			}
		})
		send({kind: offerKind, id, port: port2}, [port2])
	})
}

