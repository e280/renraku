
import type * as ws from "ws"
import type * as http from "node:http"

import {Rig} from "../messenger/parts/helpers.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap, WebSocketTaps} from "../../core/types.js"

export type WebSocketRemoteOptions<ServerFns extends Fns> = {
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
	expose: (clientside: Remote<ClientFns>, rig: Rig) => Fns
	onDisconnect: (error?: any) => void
}

export type WebSocketServerOptions<ClientFns extends Fns> = {
	expose?: (meta: HttpMeta) => Fns
} & WsSetupOptions<ClientFns>

export type WsAccepter<ClientFns extends Fns> = (connection: Connection<ClientFns>) => ConnectionReturns<ClientFns>

export type WsSetupOptions<ClientFns extends Fns> = {
	accept: WsAccepter<ClientFns>
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
}

export type WsConnectorOptions<ClientFns extends Fns> = {
	accept: WsAccepter<ClientFns>
	timeout?: number
	tap?: LoggerTap
}

export type WsConnector = (socket: ws.WebSocket, request: http.IncomingMessage) => void

