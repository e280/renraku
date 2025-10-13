
import {Conduit} from "../../../universal/messenger/conduits/conduit.js"
import {AsFns, Fns} from "../../../universal/core/types.js"
import {MessengerOptions, MessengerRpc} from "../../../universal/messenger/types.js"

export type HandshakeFns = AsFns<{
	handshake(port: MessagePort): Promise<void>
}>

export type HandshakeAliceOptions<
		AliceFns extends Fns = any,
		BobFns extends Fns = any,
	> = {
	conduit: Conduit
	rpc: MessengerRpc<AliceFns, BobFns>
} & Omit<MessengerOptions<AliceFns, BobFns>, "conduit" | "rpc">

export type HandshakeBobOptions<
		AliceFns extends Fns = any,
		BobFns extends Fns = any,
	> = {
	conduit: Conduit
	rpc: MessengerRpc<BobFns, AliceFns>
} & Omit<MessengerOptions<BobFns, AliceFns>, "conduit" | "rpc">

