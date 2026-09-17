
import {Port} from "../../types.js"
import {isOffer} from "../utils/is.js"
import {Recv, Send} from "../types.js"
import {acceptKind} from "../utils/kinds.js"

export function acceptPorts({send, recv, onPort}: {
		send: Send
		recv: Recv
		onPort: (port: Port, id: string) => void
	}) {

	return recv(data => {
		if (isOffer(data)) {
			const {port, id} = data
			onPort(port, id)
			send({kind: acceptKind, id}, [])
		}
	})
}

