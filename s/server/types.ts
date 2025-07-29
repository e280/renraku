
import {Fns, HttpMeta} from "../core/types.js"
import {LoggerTap} from "../core/taps/logger.js"
import {Transmuter} from "../transports/http/types.js"
import {Route} from "../transports/http/parts/routing.js"
import {WsAccepter} from "../transports/websocket/types.js"
import {CorsConfig} from "../transports/http/parts/transmuting.js"

export type HttpRpc<F extends Fns = any> = (meta: HttpMeta) => F
export const asHttpRpc = <F extends Fns = any>(rpc: HttpRpc<F>) => rpc

export type ServerOptions<ClientFns extends Fns = any> = {
	rpc?: HttpRpc
	websocket?: WsAccepter<ClientFns>
	tap?: LoggerTap
	cors?: CorsConfig
	timeout?: number
	maxRequestBytes?: number
	rpcRoute?: string
	healthRoute?: string
	transmuters?: Transmuter[]
	routes?: Route[]
}

