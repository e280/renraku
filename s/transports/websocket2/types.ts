
import {Sub} from "@e280/stz"
import {LoggerTap} from "../../core/taps/logger.js"
import {Remote} from "../../core/remote-proxy.js"
import {Fns, HttpMeta, Tap} from "../../core/types.js"

export type WscOptions<ServerFns extends Fns> = {
	url: string | URL
	accept: (serverside: ServerFns) => Promise<Fns>
	tap?: Tap
	timeout?: number
}

export type Connection<ClientFns extends Fns> = {
	onClosed: Sub
	clientside: Remote<ClientFns>
	ping: () => void
	close: () => void
} & HttpMeta

export type AcceptFn<ClientFns extends Fns> = (connection: Connection<ClientFns>) => Promise<Fns>

export type WssOptions<ClientFns extends Fns> = {
	port: number
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
	accept: AcceptFn<ClientFns>
}

export type Wss = {
	close: () => void
}

