
import {Port} from "../../types.js"
import {isOffer} from "../utils/is.js"
import {acceptKind} from "../utils/kinds.js"
import {Accept, Recv, Send} from "../types.js"

export function acceptPorts({send, recv, onPort}: {
		send: Send<Accept>
		recv: Recv
		onPort: (port: Port) => void
	}) {

	return recv(data => {
		if (isOffer(data)) {
			onPort(data.port)
			send({kind: acceptKind, id: data.id}, [])
		}
	})
}

