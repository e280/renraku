
import type * as http from "node:http"
import type * as stream from "node:stream"
import type * as buffer from "node:buffer"

export type HttpServerOptions = {
	listener: Listener
	timeout?: number
	transmuters?: Transmuter[]
}

export type Listener = (request: http.IncomingMessage, response: http.ServerResponse) => (void | Promise<void>)
export const asListener = <L extends http.RequestListener>(l: L) => l

export type Transmuter = (listener: http.RequestListener) => http.RequestListener
export const asTransmuter = <Tm extends Transmuter>(tm: Tm) => tm

export type ResponseData = {
	code: number
	headers: Record<string, string>
	body: string | ArrayBuffer | null
}

export type Responder = (request: http.IncomingMessage) => Promise<ResponseData>

export type Upgrader = (request: http.IncomingMessage, socket: stream.Duplex, head: buffer.Buffer) => void

