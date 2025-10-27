
import {deadline} from "@e280/stz"
import {Messenger} from "../../../universal/messenger/messenger.js"
import {Fns} from "../../../universal/core/types.js"
import {defaults} from "../../../universal/defaults.js"
import {PortConduit} from "../conduits/port.js"
import {HandshakeBobOptions, HandshakeFns} from "./types.js"

export async function handshakeBob<
		AliceFns extends Fns = any,
		BobFns extends Fns = any,
	>(options: HandshakeBobOptions<AliceFns, BobFns>) {

	return deadline(options.timeout ?? defaults.timeout, async() =>
		new Promise<Messenger<BobFns, AliceFns>>(resolve => {
			const handshaker = new Messenger<HandshakeFns, {}>({
				conduit: options.conduit,
				rpc: async() => ({
					handshake: async port => {
						handshaker.dispose()
						handshaker.conduit.dispose()
						const messenger = new Messenger<BobFns, AliceFns>({
							...options,
							conduit: new PortConduit(port),
						})
						port.start()
						resolve(messenger)
					},
				}),
			})
		})
	)
}

