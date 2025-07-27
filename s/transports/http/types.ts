
import {Fns, HttpMeta} from "../../core/types.js"
import {LoggerTap} from "../../core/taps/logger.js"
import {CorsConfig} from "./node-utils/transmuting.js"

export type HttpServerOptions = {
	expose: (meta: HttpMeta) => Fns
	tap?: LoggerTap
	timeout?: number
	cors?: CorsConfig
	maxRequestBytes?: number
}

