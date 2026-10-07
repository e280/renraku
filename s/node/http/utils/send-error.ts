
import {ServerResponse} from "node:http"
import {HttpError} from "./http-error.js"

export function sendError(response: ServerResponse) {
	return (error: unknown) => {

		response.writeHead(
			(error instanceof HttpError)
				? error.code
				: 500
		)

		response.end()
	}
}

