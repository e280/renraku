
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

respond.text = (body: string) => respond(responders.text(body))
respond.health = (body = Date.now().toString()) => respond(responders.health(body))
respond.notFound = (body = "404 not found") => respond(responders.notFound(body))
respond.forbidden = (body = "403 forbidden") => respond(responders.forbidden(body))
respond.error = (body = "500 server error") => respond(responders.forbidden(body))

export const responders = {
	text: (body: string) => async() => ({
		code: 200,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
	health: (body: string): Responder => (
		responders.text(body)
	),
	notFound: (body: string) => async() => ({
		code: 404,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
	forbidden: (body: string) => async() => ({
		code: 403,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
	error: (body: string) => async() => ({
		code: 500,
		headers: {"Content-Type": "text/plain; charset=utf-8"},
		body,
	}),
} satisfies Record<string, (...a: any[]) => Responder>

