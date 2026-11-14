
import {deadline, hex} from "@e280/stz"
import {isAccept} from "./utils/is.js"
import {offerKind} from "./utils/kinds.js"
import {Offer, Recv, Send} from "./types.js"
import {defaultPortTimeout} from "../../consts.js"
import {Channel, Port} from "../transport/types.js"

export async function offerPort<Meta = void>(options: {
		send: Send<Offer>
		recv: Recv<Meta>
		channel: Channel
		timeout?: number
	}) {

	const {send, recv, channel, timeout = defaultPortTimeout} = options
	const id = hex.random()
	const {port1, port2} = channel

	let stop = () => {}

	return deadline(timeout, new Promise<{port: Port, meta: Meta}>(resolve => {
		stop = recv((data, meta) => {
			if (isAccept(data, id)) {
				stop()
				resolve({port: port1, meta})
			}
		})
		send({kind: offerKind, id, port: port2}, [port2])
	}))
		.catch(error => {
			port1.close()
			throw error
		})
		.finally(() => stop())
}

