
import {Port} from "../../core/transport/types.js"

export type Topical<P> = {
	topic: string
	payload: P
}

export type WindowAcceptOptions = {
	topic: string
	origin: string
	from: Window | WindowProxy
	allow?: (event: MessageEvent) => boolean
}

export type PortResult = {
	port: Port
	event: MessageEvent
}

