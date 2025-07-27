
import type * as http from "node:http"

export function healthCheck(
		path: string,
		listener: http.RequestListener = () => {},
	): http.RequestListener {

	return async(request, response) => {
		if (request.url === path) {
			response.setHeader("Content-Type", "text/plain; charset=utf-8")
			response.statusCode = 200
			response.end(Date.now().toString())
		}
		else
			return listener(request, response)
	}
}

