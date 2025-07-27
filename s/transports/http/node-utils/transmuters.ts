
import * as http from "http"

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

export function transmute(listener: http.RequestListener, ...tms: Transmuter[]) {
	for (const tm of tms.toReversed())
		listener = tm(listener)
	return listener
}

export const transmuters = {
	allowCors: () => asTransmuter(listener => async(request, response) => {
		response.setHeader("Access-Control-Allow-Origin", "*")
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if (request.method?.toUpperCase() === "OPTIONS") {
			response.statusCode = 200
			response.end()
		}
		else return listener(request, response)
	}),
} satisfies Record<string, (...a: any[]) => Transmuter>

export const responders = {
	healthCheck: async() => ({
		code: 200,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body: null,
	}),
	notFound: async() => ({
		code: 404,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body: "404 not found",
	}),
} satisfies Record<string, Responder>

export const listeners = {
	healthCheck: async(_request, response) => {
		response.setHeader("Content-Type", "text/plain; charset=utf-8")
		response.statusCode = 200
		response.end(Date.now().toString())
	},
	notFound: async(_request, response) => {
		response.setHeader("Content-Type", "text/plain; charset=utf-8")
		response.statusCode = 404
		response.end("404 not found")
	},
} satisfies Record<string, http.RequestListener>

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
			const listener = route?.listener ?? listeners.notFound
			return listener(request, response)
		}
		else {
			const route = routes.find(r => r.method.toUpperCase() === method && r.url === url)
			const listener = route?.listener ?? listeners.notFound
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

