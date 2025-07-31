
import {MessengerMeta} from "./parts/meta.js"
import {Conduit} from "./conduits/conduit.js"
import {Tap, Fns} from "../../core/types.js"

export type MessengerRpc<F extends Fns> = (meta: MessengerMeta<F>) => Promise<Fns>

export function asMessengerRpc<F extends Fns>(mrpc: MessengerRpc<F>) {
	return mrpc
}

export type MessengerOptions<xRemoteFns extends Fns> = {
	conduit: Conduit
	tap?: Tap
	timeout?: number
	rpc?: MessengerRpc<xRemoteFns>
}

export type ChannelMessage<D = any> = {data: D, origin: string}

export type Channel = {
	addEventListener(e: "message", listener: (event: ChannelMessage) => void): void
	removeEventListener(e: "message", listener: (event: ChannelMessage) => void): void
}

export type PostableChannel = {
	postMessage(m: any, transfer?: Transferable[]): void
} & Channel

