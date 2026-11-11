
import {hex} from "@e280/stz"
import {isAccept} from "./utils/is.js"
import {offerKind} from "./utils/kinds.js"
import {Channel, Port} from "../transport/types.js"
import {Offer, Recv, Send} from "./types.js"

export async function offerPort<Meta = void>({send, recv, channel}: {
		send: Send<Offer>
		recv: Recv<Meta>
		channel: Channel
	}) {

	const id = hex.random()
	const {port1, port2} = channel

	return new Promise<{port: Port, meta: Meta}>(resolve => {
		const stop = recv((data, meta) => {
			if (isAccept(data, id)) {
				stop()
				resolve({port: port1, meta})
			}
		})
		send({kind: offerKind, id, port: port2}, [port2])
	})
}

