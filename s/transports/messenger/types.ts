
import {MessengerMeta} from "./parts/meta.js"
import {Conduit} from "./conduits/conduit.js"
import {Tap, Fns} from "../../core/types.js"

export type MessengerRpc<LocalFns extends Fns, RemoteFns extends Fns> = (meta: MessengerMeta<RemoteFns>) => Promise<LocalFns>

export function asMessengerRpc<LocalFns extends Fns, RemoteFns extends Fns>(mrpc: MessengerRpc<LocalFns, RemoteFns>) {
	return mrpc
}

export type MessengerOptions<LocalFns extends Fns, RemoteFns extends Fns> = {
	conduit: Conduit
	tap?: Tap
	timeout?: number
	rpc?: MessengerRpc<LocalFns, RemoteFns>
}

export type ChannelMessage<D = any> = {data: D, origin: string}

export type Channel = {
	addEventListener(e: "message", listener: (event: ChannelMessage) => void): void
	removeEventListener(e: "message", listener: (event: ChannelMessage) => void): void
}

export type PostableChannel = {
	postMessage(m: any, transfer?: Transferable[]): void
} & Channel

