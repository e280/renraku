
import {JsonRpc} from "./json-rpc.js"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export type Service = Record<string, Fn>
export type AsFns<F extends Fns> = F

export function asFns<F extends Fns>(f: F) {
	return f
}

export type HttpRequest = {
	headers: Record<string, string | string[] | undefined>
	headersDistinct: Record<string, string[] | undefined>
	rawHeaders: string[]
	method?: string
	url?: string
	statusCode?: number
	statusMessage?: string
}

export type HttpMeta = {
	request: HttpRequest
	ip: string
}

export type TapContext = {
	label?: string
	meta?: HttpMeta
	remote?: boolean
}

export type Tap = {
	error: (o: {
		error: any
	} & TapContext) => Promise<void>

	rpcRequest: (o: {
		request: JsonRpc.Request
	} & TapContext) => Promise<void>

	rpcError: (o: {
		error: any
		request: JsonRpc.Request
	} & TapContext) => Promise<void>
}

export type EndpointSpecial = {
	transfer?: any[]
}

export type Endpoint = (
	request: JsonRpc.Request,
	special?: EndpointSpecial,
) => Promise<JsonRpc.Response | null>

