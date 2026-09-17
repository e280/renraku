
import {Port} from "../../types.js"
import {isOffer} from "../utils/is.js"
import {acceptKind} from "../utils/kinds.js"
import {Accept, Recv, Send} from "../types.js"

export function acceptPorts<M>({send, recv, onPort}: {
		send: Send<Accept>
		recv: Recv<M>
		onPort: (port: Port, meta: M) => void
	}) {

	return recv((data, meta) => {
		if (isOffer(data)) {
			onPort(data.port, meta)
			send({kind: acceptKind, id: data.id}, [])
		}
	})
}

