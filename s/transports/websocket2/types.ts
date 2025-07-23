
import type * as ws from "ws"

import {Rig} from "../messenger/parts/helpers.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap} from "../../core/types.js"

export type WscOptions<ServerFns extends Fns> = {
	socket: WebSocket | ws.WebSocket
	accept: (serverside: Remote<ServerFns>, rig: Rig) => Fns
	onDisconnect: (error?: any) => void
	tap?: Tap
	timeout?: number
}

export type Connection<ClientFns extends Fns> = {
	rig: Rig
	clientside: Remote<ClientFns>
	close: () => void
} & HttpMeta

export type ConnectionReturns = {
	fns: Fns
	onDisconnect: (error?: any) => void
}

export type WssOptions<ClientFns extends Fns> = {
	port: number
	accept: (connection: Connection<ClientFns>) => ConnectionReturns
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
}

export type Wss = {
	close: () => void
}

