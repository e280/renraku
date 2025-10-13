
import {Fns, HttpMeta} from "../../universal/core/types.js"
import {LoggerTap} from "../../universal/core/taps/logger.js"
import {Transmuter} from "../transports/http/types.js"
import {Route} from "../transports/http/parts/routing.js"
import {Accepter} from "../transports/websocket/types.js"
import {CorsConfig} from "../transports/http/parts/transmuting.js"

export type Rpc<F extends Fns> = (meta: HttpMeta) => Promise<F>
export const asRpc = <F extends Fns>(rpc: Rpc<F>) => rpc

export type ServerOptions = {
	rpc?: Rpc<any>
	websocket?: Accepter<any, any>
	tap?: LoggerTap
	cors?: CorsConfig
	timeout?: number
	maxRequestBytes?: number
	rpcRoute?: string
	healthRoute?: string
	transmuters?: Transmuter[]
	routes?: Route[]
}

