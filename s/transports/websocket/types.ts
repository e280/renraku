
import type * as ws from "ws"
import type * as http from "node:http"

import {Rtt} from "../../tools/pingponger.js"
import {Remote} from "../../core/remote-proxy.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {Fns, HttpMeta, Tap} from "../../core/types.js"

export type WsConnector<LocalFns extends Fns, RemoteFns extends Fns> = (
	(connection: Connection<RemoteFns>) => Promise<Connret<LocalFns>>
)

export const asWsConnector = <LocalFns extends Fns, RemoteFns extends Fns>(
	connector: WsConnector<LocalFns, RemoteFns>
) => connector

export type WsAccepter<LocalFns extends Fns, RemoteFns extends Fns> = (
	(connection: Connection<RemoteFns> & HttpMeta) => Promise<Connret<LocalFns>>
)

export const asWsAccepter = <LocalFns extends Fns, RemoteFns extends Fns>(
	accepter: WsAccepter<LocalFns, RemoteFns>
) => accepter

export type WsConnectOptions<RemoteFns extends Fns> = {
	socket: WebSocket | ws.WebSocket
	connector: WsConnector<any, RemoteFns>
	disconnected: (error?: any) => void
	tap?: Tap
	timeout?: number
}

export type Connection<RemoteFns extends Fns> = {
	rtt: Rtt
	socket: WebSocket | ws.WebSocket
	remote: Remote<RemoteFns>
	tap?: Tap
	detach: () => void
	close: () => void
}

export type Connret<LocalFns extends Fns> = {
	fns: LocalFns
	disconnected: (error?: any) => void
}

export type WsIntegrationOptions<RemoteFns extends Fns> = {
	accepter: WsAccepter<any, RemoteFns>
	tap?: LoggerTap
	timeout?: number
	maxRequestBytes?: number
}

export type WsHandlerOptions<ClientFns extends Fns> = {
	accepter: WsAccepter<any, ClientFns>
	timeout?: number
	tap?: LoggerTap
}

export type WsHandler = (socket: ws.WebSocket, request: http.IncomingMessage) => void

