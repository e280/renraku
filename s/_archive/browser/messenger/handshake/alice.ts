
import {Messenger} from "../../../universal/messenger/messenger.js"
import {Fns} from "../../../universal/core/types.js"
import {PortConduit} from "../conduits/port.js"
import {tune} from "../../../universal/core/remote-proxy.js"
import {HandshakeAliceOptions, HandshakeFns} from "./types.js"

export async function handshakeAlice<
		AliceFns extends Fns = any,
		BobFns extends Fns = any,
	>(options: HandshakeAliceOptions<AliceFns, BobFns>) {

	const handshaker = new Messenger<{}, HandshakeFns>({
		conduit: options.conduit,
	})

	const {port1, port2} = new MessageChannel()

	try {
		await handshaker.remote.handshake[tune]({transfer: [port2]})(port2)
	}
	finally {
		handshaker.dispose()
		handshaker.conduit.dispose()
	}

	const messenger = new Messenger<AliceFns, BobFns>({
		...options,
		conduit: new PortConduit(port1),
	})

	port1.start()
	return messenger
}

