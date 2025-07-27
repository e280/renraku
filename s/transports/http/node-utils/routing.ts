
import * as http from "node:http"
import {respond, responders} from "./responding.js"

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

