
import type * as ws from "ws"
import type * as http from "node:http"
import type * as stream from "node:stream"
import type * as buffer from "node:buffer"

import {Rig} from "../messenger/parts/helpers.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap, WebSocketTaps} from "../../core/types.js"
import {CorsConfig} from "../http/node-utils/transmuting.js"
import {NiceHttpServer} from "../http/node-utils/nice-http-server.js"

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
	host?: string
} & WsUpgraderOptions<ClientFns>

export type WsUpgraderOptions<ClientFns extends Fns> = {
	accept: (connection: Connection<ClientFns>) => ConnectionReturns<ClientFns>
	tap?: LoggerTap
	timeout?: number
	cors?: CorsConfig
	maxRequestBytes?: number
}

export type Wss = {
	niceServer: NiceHttpServer
	wsServer: ws.WebSocketServer
}

export type Upgrader = (request: http.IncomingMessage, socket: stream.Duplex, head: buffer.Buffer) => void

