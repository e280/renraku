
import * as http from "node:http"

export type Listener = (request: http.IncomingMessage, response: http.ServerResponse) => Promise<void>
export const asListener = <L extends http.RequestListener>(l: L) => l

export type Transmuter = (listener: http.RequestListener) => http.RequestListener
export const asTransmuter = <Tm extends Transmuter>(tm: Tm) => tm

export type ResponseData = {
	code: number
	headers: Record<string, string>
	body: string | ArrayBuffer | null
}

export type Responder = (request: http.IncomingMessage) => Promise<ResponseData>

