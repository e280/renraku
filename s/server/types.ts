
import {Fns, HttpMeta} from "../core/types.js"
import {LoggerTap} from "../core/taps/logger.js"
import {Transmuter} from "../transports/http/types.js"
import {Route} from "../transports/http/parts/routing.js"
import {WsAccepter} from "../transports/websocket/types.js"
import {CorsConfig} from "../transports/http/parts/transmuting.js"

export type RenrakuServerOptions<ClientFns extends Fns = any> = {
	rpc?: (meta: HttpMeta) => Fns
	websocket?: WsAccepter<ClientFns>
	tap?: LoggerTap
	timeout?: number
	cors?: CorsConfig
	maxRequestBytes?: number
	routes?: Route[]
	rpcRoute?: string
	healthRoute?: string
	transmuters?: Transmuter[]
}

