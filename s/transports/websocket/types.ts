
import type * as ws from "ws"
import type * as http from "node:http"

import {Rtt} from "../../tools/pingponger.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap, WebSocketTaps} from "../../core/types.js"

export type WsRpc<LocalFns extends Fns, RemoteFns extends Fns> = (remote: Remote<RemoteFns>) => LocalFns
export const asWsRpc = <LocalFns extends Fns, RemoteFns extends Fns>(rpc: WsRpc<LocalFns, RemoteFns>) => rpc

export type WsRemoteOptions<ServerFns extends Fns> = {
	socket: WebSocket | ws.WebSocket
	rpc: WsRpc<any, ServerFns>
	disconnected: (error?: any) => void
	tap?: Tap
	timeout?: number
}

export type Connection<ClientFns extends Fns> = {
	rtt: Rtt
	socket: ws.WebSocket
	remote: Remote<ClientFns>
	close: () => void
	taps?: WebSocketTaps
} & HttpMeta

export type ConnectionReturns<ClientFns extends Fns> = {
	rpc: WsRpc<any, ClientFns>
	disconnected: (error?: any) => void
}

export type WsAccepter<ClientFns extends Fns> = (connection: Connection<ClientFns>) => Promise<ConnectionReturns<ClientFns>>

export function websocket<ClientFns extends Fns>(accept: WsAccepter<ClientFns>) {
	return accept
}

export type WsIntegrationOptions<ClientFns extends Fns> = {
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

