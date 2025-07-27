
import type * as ws from "ws"
import type * as http from "node:http"
import type * as stream from "node:stream"
import type * as buffer from "node:buffer"

import {Rig} from "../messenger/parts/helpers.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap, WebSocketTaps} from "../../core/types.js"

export type WscOptions<ServerFns extends Fns> = {
	socket: WebSocket | ws.WebSocket
	expose: (serverside: Remote<ServerFns>, rig: Rig) => Fns
	onDisconnect: (error?: any) => void
	tap?: Tap
	timeout?: number
}

export type Connection<ClientFns extends Fns> = {
	socket: ws.WebSocket
	clientside: Remote<ClientFns>
	close: () => void
	taps?: WebSocketTaps
} & HttpMeta

export type ConnectionReturns<ClientFns extends Fns> = {
	expose: (serverside: Remote<ClientFns>, rig: Rig) => Fns
	onDisconnect: (error?: any) => void
}

export type WssOptions<ClientFns extends Fns> = {
	port: number
	accept: (connection: Connection<ClientFns>) => ConnectionReturns<ClientFns>
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
}

export type Wss = {
	httpServer: http.Server
	wsServer: ws.WebSocketServer
}

export type Upgrader = (request: http.IncomingMessage, socket: stream.Duplex, head: buffer.Buffer) => void

