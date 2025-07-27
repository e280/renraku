
import type * as http from "node:http"

export function allowCors(listener: http.RequestListener): http.RequestListener {
	return async(request, response) => {
		response.setHeader("Access-Control-Allow-Origin", "*")
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if (request.method?.toUpperCase() === "OPTIONS") {
			response.statusCode = 200
			response.end()
		}
		else
			return listener(request, response)
	}
}

