
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

/** convert a responder into a listener */
export function respond(responder: Responder): Listener {
	return async(request, response) => {
		const {code, headers, body} = await responder(request)
		response.writeHead(code, headers)
		if (body) response.end(body)
		else response.end()
	}
}

export function transmute(listener: http.RequestListener, tms: Transmuter[]) {
	for (const tm of tms.toReversed())
		listener = tm(listener)
	return listener
}

export type CorsConfig = {
	origins?: "*" | string[]
	methods?: string[]
	headers?: string[]
}

export const transmuters = {
	allowCors: ({
			origins = "*",
			methods = ["GET", "POST", "OPTIONS"],
			headers = ["Content-Type", "Authorization"],
		}: CorsConfig = {}) => {
		return asTransmuter(listener => async(request, response) => {
			response.setHeader("Vary", "Origin")
			const origin = request.headers.origin?.toLowerCase()
			if (origin) {
				const allowedOrigin = origins === "*"
					? "*"
					: (origins.some(o => o.toLowerCase() === origin))
						? origin
						: false
				if (allowedOrigin) {
					response.setHeader("Access-Control-Allow-Origin", allowedOrigin)
					response.setHeader("Access-Control-Allow-Methods", methods.join(", "))
					response.setHeader("Access-Control-Allow-Headers", headers.join(", "))
					if (request.method?.toUpperCase() === "OPTIONS") {
						response.statusCode = 204
						response.end()
						return
					}
				}
			}
			return listener(request, response)
		})
	},
} satisfies Record<string, (...a: any[]) => Transmuter>

export const responders = {
	text: (body: string) => async() => ({
		code: 200,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
	healthCheck: (body = Date.now().toString()): Responder => (
		responders.text(body)
	),
	notFound: (body = "404 not found") => async() => ({
		code: 404,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
} satisfies Record<string, (...a: any[]) => Responder>

export function router(...routes: Route[]): http.RequestListener {
	return async(request, response) => {
		const url = request.url ?? "/"
		const method = (request.method ?? "GET").toUpperCase()
		if (method === "HEAD") {
			const route = routes.find(r => r.method.toUpperCase() === "GET" && r.url === url)
			const end = response.end as any
			response.write = () => true
			response.end = () => {
				end.call(response)
				return response
			}
			const listener = route?.listener ?? respond(responders.notFound())
			return listener(request, response)
		}
		else {
			const route = routes.find(r => r.method.toUpperCase() === method && r.url === url)
			const listener = route?.listener ?? respond(responders.notFound())
			return listener(request, response)
		}
	}
}

export function route(method: string, url: string, listener: http.RequestListener) {
	return new Route(method, url, listener)
}

route.get = (url: string, listener: http.RequestListener) => route("GET", url, listener)
route.post = (url: string, listener: http.RequestListener) => route("POST", url, listener)

export class Route {
	constructor(
		public method: string,
		public url: string,
		public listener: http.RequestListener,
	) {}
}

