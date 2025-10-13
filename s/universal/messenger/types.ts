
import {EvTarget} from "@e280/stz"
import {Tap, Fns} from "../core/types.js"
import {MessengerMeta} from "./parts/meta.js"
import {Conduit} from "./conduits/conduit.js"

export type UniWebSocket = {
	send(data: string | ArrayBuffer | Uint8Array): void
	readyState: number
	close(): void
} & EvTarget<"open" | "error" | "close" | "message" | string>

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

