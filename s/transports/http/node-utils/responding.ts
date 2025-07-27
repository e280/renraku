
import {Listener, Responder} from "./types.js"

/** convert a responder into a listener */
export function respond(responder: Responder): Listener {
	return async(request, response) => {
		const {code, headers, body} = await responder(request)
		response.writeHead(code, headers)
		if (body) response.end(body)
		else response.end()
	}
}

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

