
import type * as http from "node:http"
import {JsonRpc} from "./json-rpc.js"

export type Fn = (...p: any[]) => Promise<any>
export type Fns = {[key: string]: Fn | Fns}
export type Service = Record<string, Fn>
export type AsFns<F extends Fns> = F

export function asFns<F extends Fns>(f: F) {
	return f
}

export type HttpMeta = {
	request: http.IncomingMessage
	ip: string
}

export type Tap = {
	error: (error: any) => Promise<void>

	request: (options: {
		request: JsonRpc.Request
		label?: string
	}) => Promise<void>

	rpcError: (options: {
		error: any
		request: JsonRpc.Request
		label?: string
	}) => Promise<void>
}

export type DoubleTap = {
	local?: Tap
	remote?: Tap
}

export type EndpointSpecial = {
	transfer?: Transferable[]
}

export type Endpoint = (
	request: JsonRpc.Request,
	special?: EndpointSpecial,
) => Promise<JsonRpc.Response | null>

