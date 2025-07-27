
import * as http from "node:http"
import {Transmuter, asTransmuter} from "./types.js"

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

