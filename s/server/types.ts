
import {Fns, HttpMeta} from "../core/types.js"
import {LoggerTap} from "../core/taps/logger.js"
import {Transmuter} from "../transports/http/types.js"
import {Route} from "../transports/http/parts/routing.js"
import {Accepter} from "../transports/websocket/types.js"
import {CorsConfig} from "../transports/http/parts/transmuting.js"

export type Rpc<F extends Fns = any> = (meta: HttpMeta) => F
export const asRpc = <F extends Fns = any>(rpc: Rpc<F>) => rpc

export type ServerOptions<ClientFns extends Fns = any> = {
	rpc?: Rpc
	websocket?: Accepter<any, ClientFns>
	tap?: LoggerTap
	cors?: CorsConfig
	timeout?: number
	maxRequestBytes?: number
	rpcRoute?: string
	healthRoute?: string
	transmuters?: Transmuter[]
	routes?: Route[]
}

