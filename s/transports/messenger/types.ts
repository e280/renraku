
import {Rig} from "./parts/helpers.js"
import {Conduit} from "./conduits/conduit.js"
import {Remote} from "../../core/remote-proxy.js"
import {Endpoint, Fns, Tap} from "../../core/types.js"

export type MessengerOptions<xRemoteFns extends Fns> = {
	conduit: Conduit
	getLocalEndpoint?: (remote: Remote<xRemoteFns>, rig: Rig) => Endpoint
	timeout?: number
	tap?: Tap
}

export type ChannelMessage<D = any> = {data: D, origin: string}

export type Channel = {
	addEventListener(e: "message", listener: (event: ChannelMessage) => void): void
	removeEventListener(e: "message", listener: (event: ChannelMessage) => void): void
}

export type PostableChannel = {
	postMessage(m: any, transfer?: Transferable[]): void
} & Channel

