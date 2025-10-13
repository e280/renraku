
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

	// TODO maybe rpc should be required?
	rpc?: MessengerRpc<LocalFns, RemoteFns>
}

export type MessageLike<D = any> = {data: D, origin: string, source: MessageEvent["source"]}

export type MessageReceiver = {
	addEventListener(e: "message", listener: (event: MessageLike) => void): void
	removeEventListener(e: "message", listener: (event: MessageLike) => void): void
}

export type Messagable = {
	postMessage(m: any, transfer?: Transferable[]): void
} & MessageReceiver

/** @deprecated renamed to 'MessageLike' */
export type ChannelMessage<D = any> = MessageLike<D>

/** @deprecated renamed to 'MessageReceiver' */
export type Channel = MessageReceiver

/** @deprecated renamed to 'Messagable' */
export type PostableChannel = Messagable

